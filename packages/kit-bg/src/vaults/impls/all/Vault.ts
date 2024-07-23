/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IEncodedTx, IUnsignedTxPro } from '@onekeyhq/core/src/types';
import { IMPL_ALLNETWORKS } from '@onekeyhq/shared/src/engine/engineConsts';
import { NotImplemented } from '@onekeyhq/shared/src/errors';
import type {
  IAddressValidation,
  IGeneralInputValidation,
  INetworkAccountAddressDetail,
  IPrivateKeyValidation,
  IXprvtValidation,
  IXpubValidation,
} from '@onekeyhq/shared/types/address';
import type { IDecodedTx } from '@onekeyhq/shared/types/tx';

import { VaultBase } from '../../base/VaultBase';

import { KeyringExternal } from './KeyringExternal';
import { KeyringHardware } from './KeyringHardware';
import { KeyringHd } from './KeyringHd';
import { KeyringImported } from './KeyringImported';
import { KeyringWatching } from './KeyringWatching';

import type { IDBWalletType } from '../../../dbs/local/types';
import type { KeyringBase } from '../../base/KeyringBase';
import type {
  IBuildAccountAddressDetailParams,
  IBuildDecodedTxParams,
  IBuildEncodedTxParams,
  IBuildUnsignedTxParams,
  IGetPrivateKeyFromImportedParams,
  IGetPrivateKeyFromImportedResult,
  IUpdateUnsignedTxParams,
  IValidateGeneralInputParams,
} from '../../types';

export default class Vault extends VaultBase {
  override keyringMap: Record<IDBWalletType, typeof KeyringBase | undefined> = {
    hd: KeyringHd,
    qr: undefined, // KeyringQr,
    hw: KeyringHardware,
    imported: KeyringImported,
    watching: KeyringWatching,
    external: KeyringExternal,
  };

  override buildAccountAddressDetail(
    params: IBuildAccountAddressDetailParams,
  ): Promise<INetworkAccountAddressDetail> {
    const { networkId } = params;
    const allNetWorkAddress = 'All Network';
    return Promise.resolve({
      networkId,
      normalizedAddress: allNetWorkAddress,
      displayAddress: allNetWorkAddress,
      address: allNetWorkAddress,
      baseAddress: allNetWorkAddress,
      isValid: true,
      allowEmptyAddress: true,
    });
  }

  override buildEncodedTx(params: IBuildEncodedTxParams): Promise<IEncodedTx> {
    throw new NotImplemented();
  }

  override buildDecodedTx(params: IBuildDecodedTxParams): Promise<IDecodedTx> {
    throw new NotImplemented();
  }

  override buildUnsignedTx(
    params: IBuildUnsignedTxParams,
  ): Promise<IUnsignedTxPro> {
    throw new NotImplemented();
  }

  override updateUnsignedTx(
    params: IUpdateUnsignedTxParams,
  ): Promise<IUnsignedTxPro> {
    throw new NotImplemented();
  }

  override validateAddress(address: string): Promise<IAddressValidation> {
    throw new NotImplemented();
  }

  override validateXpub(xpub: string): Promise<IXpubValidation> {
    throw new NotImplemented();
  }

  override getPrivateKeyFromImported(
    params: IGetPrivateKeyFromImportedParams,
  ): Promise<IGetPrivateKeyFromImportedResult> {
    throw new NotImplemented();
  }

  override validateXprvt(xprvt: string): Promise<IXprvtValidation> {
    throw new NotImplemented();
  }

  override validatePrivateKey(
    privateKey: string,
  ): Promise<IPrivateKeyValidation> {
    throw new NotImplemented();
  }

  override validateGeneralInput(
    params: IValidateGeneralInputParams,
  ): Promise<IGeneralInputValidation> {
    throw new NotImplemented();
  }

  override async buildFetchHistoryListParams(params: {
    accountId: string;
    networkId: string;
    accountAddress: string;
  }): Promise<{
    allNetworkAccounts: Array<{ networkId: string; accountAddress: string }>;
  }> {
    const { accountId, networkId } = params;
    const account = await this.backgroundApi.serviceAccount.getAccount({
      accountId,
      networkId,
    });
    const allAccounts = (
      await this.backgroundApi.serviceAccount.getAccountsInSameIndexedAccountId(
        {
          indexedAccountId: account.indexedAccountId ?? '',
        },
      )
    ).filter((a) => a.impl !== IMPL_ALLNETWORKS);

    const allNetworkAccounts: Array<{
      accountId: string;
      networkId: string;
      accountAddress: string;
    }> = [];
    for (const a of allAccounts) {
      const networks = (
        await this.backgroundApi.serviceNetwork.getNetworksByImpls({
          impls: [a.impl],
        })
      ).networks.filter((i) => !i.isTestnet);

      for (const n of networks) {
        const accountAddress =
          await this.backgroundApi.serviceAccount.getAccountAddressForApi({
            accountId: a.id,
            networkId: n.id,
          });
        allNetworkAccounts.push({
          accountId: a.id,
          networkId: n.id,
          accountAddress,
        });
      }
    }
    return { allNetworkAccounts };
  }
}