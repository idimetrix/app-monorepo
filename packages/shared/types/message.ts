export enum EMessageTypesEth {
  ETH_SIGN = 'ETH_SIGN', // 0
  PERSONAL_SIGN = 'PERSONAL_SIGN', // 1
  TYPED_DATA_V1 = 'TYPED_DATA_V1', // 2
  TYPED_DATA_V3 = 'TYPED_DATA_V3', // 3
  TYPED_DATA_V4 = 'TYPED_DATA_V4', // 4
}

export enum EMessageTypesAptos {
  SIGN_MESSAGE = 'aptosSignMessage',
}

export enum EMessageTypesCommon {
  SIGN_MESSAGE = 'commonSignMessage',
  SIMPLE_SIGN = 'commonSimpleSign',
  HEX_MESSAGE = 'commonHexMessage',
}

export enum EMessageTypesAda {
  SIGN_MESSAGE = 'adaSignMessage',
}

export enum EMessageTypesBtc {
  ECDSA = 'ecdsa',
  BIP322_SIMPLE = 'bip322-simple',
}

export enum EMessageTypesTon {
  SIGN_DATA = 'tonSignData',
  SIGN_PROOF = 'tonSignProof',
}
