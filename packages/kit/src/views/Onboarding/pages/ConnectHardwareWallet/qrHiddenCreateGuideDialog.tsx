import { Dialog, Stack } from '@onekeyhq/components';
import { TutorialsList } from '@onekeyhq/kit/src/components/TutorialsList';
import type { ITutorialsListItem } from '@onekeyhq/kit/src/components/TutorialsList';
import { ETranslations } from '@onekeyhq/shared/src/locale';
import { appLocale } from '@onekeyhq/shared/src/locale/appLocale';

function showDialog() {
  const tutorials: ITutorialsListItem[] = [
    {
      title: appLocale.intl.formatMessage({
        id: ETranslations.create_qr_bassed_hidden_wallet_create_standard_wallet_title,
      }),
      description: appLocale.intl.formatMessage({
        id: ETranslations.create_qr_bassed_hidden_wallet_create_standard_wallet_desc,
      }),
    },
    {
      title: appLocale.intl.formatMessage({
        id: ETranslations.create_qr_bassed_hidden_wallet_create_hidden_wallet_title,
      }),
      description: appLocale.intl.formatMessage({
        id: ETranslations.create_qr_bassed_hidden_wallet_create_hidden_wallet_desc,
      }),
    },
  ];
  Dialog.show({
    title: appLocale.intl.formatMessage({
      id: ETranslations.create_qr_based_hidden_wallet_dialog_title,
    }),
    showConfirmButton: false,
    onCancelText: appLocale.intl.formatMessage({
      id: ETranslations.global_close,
    }),
    renderContent: (
      <Stack>
        <TutorialsList tutorials={tutorials} />
      </Stack>
    ),
  });
}

export default { showDialog };
