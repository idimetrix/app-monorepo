import { web3Errors } from '@onekeyfe/cross-inpage-provider-errors';
import { IInjectedProviderNames } from '@onekeyfe/cross-inpage-provider-types';
import { keccak256, recoverPublicKey } from 'viem';

import type { IEncodedTxScdo } from '@onekeyhq/core/src/chains/scdo/types';
import {
  backgroundClass,
  providerApiMethod,
} from '@onekeyhq/shared/src/background/backgroundDecorators';
import {
  NotImplemented,
  OneKeyInternalError,
} from '@onekeyhq/shared/src/errors';
import { defaultLogger } from '@onekeyhq/shared/src/logger/logger';
import bufferUtils from '@onekeyhq/shared/src/utils/bufferUtils';
import hexUtils from '@onekeyhq/shared/src/utils/hexUtils';
import timerUtils from '@onekeyhq/shared/src/utils/timerUtils';
import { EMessageTypesCommon } from '@onekeyhq/shared/types/message';

import { publicKeyToAddress } from '../vaults/impls/scdo/utils';

import ProviderApiBase from './ProviderApiBase';

import type { IProviderBaseBackgroundNotifyInfo } from './ProviderApiBase';
import type { IJsBridgeMessagePayload } from '@onekeyfe/cross-inpage-provider-types';

@backgroundClass()
class ProviderApiScdo extends ProviderApiBase {
  public providerName = IInjectedProviderNames.scdo;

  public override notifyDappAccountsChanged(
    info: IProviderBaseBackgroundNotifyInfo,
  ): void {
    const data = async ({ origin }: { origin: string }) => {
      const accounts = await this.scdo_getAccounts({
        origin,
        scope: this.providerName,
      });
      const result = {
        method: 'wallet_events_accountsChanged',
        params: {
          accounts,
        },
      };
      return result;
    };
    info.send(data, info.targetOrigin);
  }

  public override notifyDappChainChanged(): void {
    throw new NotImplemented();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async rpcCall(request: IJsBridgeMessagePayload): Promise<any> {
    return Promise.resolve();
  }

  // Provider API
  @providerApiMethod()
  async scdo_requestAccounts(request: IJsBridgeMessagePayload) {
    try {
      await this.backgroundApi.serviceDApp.openConnectionModal(request);
      await timerUtils.wait(100);
      const accountsInfo = await this.getAccountsInfo(request);
      return accountsInfo.map((i) => i.account?.address);
    } catch (e) {
      return [];
    }
  }

  @providerApiMethod()
  public async scdo_disconnect(request: IJsBridgeMessagePayload) {
    const { origin } = request;
    if (!origin) {
      return;
    }
    await this.backgroundApi.serviceDApp.disconnectWebsite({
      origin,
      storageType: 'injectedProvider',
    });
    return true;
  }

  @providerApiMethod()
  public async scdo_getAccounts(request: IJsBridgeMessagePayload) {
    const accountsInfo = await this.getAccountsInfo(request);
    return accountsInfo.map((i) => i.account?.address);
  }

  private async _rpcCall(request: IJsBridgeMessagePayload) {
    const params = request.data as { method: string; params: [any] };
    const accountInfo = await this.getAccountsInfo(request);
    const { accountInfo: { networkId } = {} } = accountInfo[0];
    if (!networkId) {
      throw new OneKeyInternalError('scdo_getBalance networkId is required');
    }
    const [res] =
      await this.backgroundApi.serviceAccountProfile.sendProxyRequest<number>({
        networkId,
        body: [
          {
            route: 'rpc',
            params,
          },
        ],
      });
    return res;
  }

  @providerApiMethod()
  public scdo_getBalance(request: IJsBridgeMessagePayload) {
    return this._rpcCall(request);
  }

  @providerApiMethod()
  public scdo_estimateGas(request: IJsBridgeMessagePayload) {
    return this._rpcCall(request);
  }

  private async _signAndSendTransaction(
    request: IJsBridgeMessagePayload,
    isSend = false,
  ) {
    const accounts = await this.getAccountsInfo(request);
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts');
    }

    const {
      params: [encodedTx],
    } = request.data as { method: string; params: [IEncodedTxScdo] };
    const { account, accountInfo } = accounts[0];
    const result =
      await this.backgroundApi.serviceDApp.openSignAndSendTransactionModal({
        request,
        encodedTx,
        accountId: account.id,
        networkId: accountInfo?.networkId ?? '',
        signOnly: !isSend,
      });

    const tx = {
      Data: encodedTx,
      Hash: result.txid,
      Signature: {
        Sig: result.signature,
      },
    };

    return tx;
  }

  @providerApiMethod()
  public scdo_signTransaction(request: IJsBridgeMessagePayload) {
    return this._signAndSendTransaction(request, false);
  }

  @providerApiMethod()
  public scdo_sendTransaction(request: IJsBridgeMessagePayload) {
    return this._signAndSendTransaction(request, true);
  }

  @providerApiMethod()
  public async scdo_signMessage(request: IJsBridgeMessagePayload) {
    const accounts = await this.getAccountsInfo(request);
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts');
    }

    const {
      params: [message],
    } = request.data as {
      params: [string];
    };
    const account = accounts[0];
    const result = (await this.backgroundApi.serviceDApp.openSignMessageModal({
      request,
      unsignedMessage: {
        type: EMessageTypesCommon.SIMPLE_SIGN,
        message,
        secure: true,
      },
      networkId: account.accountInfo?.networkId ?? '',
      accountId: account.account.id ?? '',
    })) as string;

    return Buffer.from(result, 'hex').toString('base64');
  }

  @providerApiMethod()
  public async scdo_ecRecover(
    request: IJsBridgeMessagePayload,
    message: string,
    signature: string,
  ) {
    defaultLogger.discovery.dapp.dappRequest({ request });
    const signatureBytes =
      typeof signature === 'string'
        ? Buffer.from(signature, 'base64')
        : Buffer.alloc(0);
    if (
      typeof message === 'string' &&
      typeof signature === 'string' &&
      signatureBytes.length === 65
    ) {
      const msgHash = bufferUtils.hexToBytes(
        hexUtils.stripHexPrefix(keccak256(Buffer.from(message))),
      );
      const pubKey = await recoverPublicKey({
        hash: msgHash,
        signature: signatureBytes,
      });
      return publicKeyToAddress(pubKey);
    }
    throw web3Errors.rpc.invalidParams(
      'scdo_ecRecover requires a message and a 65 bytes signature.',
    );
  }
}

export default ProviderApiScdo;
