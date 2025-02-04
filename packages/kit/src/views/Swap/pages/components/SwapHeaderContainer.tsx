import { memo, useCallback } from 'react';

import { useIntl } from 'react-intl';

import { Badge, Dialog, SizableText, XStack } from '@onekeyhq/components';
import { ETranslations } from '@onekeyhq/shared/src/locale';

import SwapHeaderRightActionContainer from './SwapHeaderRightActionContainer';

const SwapHeaderContainer = () => {
  const intl = useIntl();
  const headerRight = useCallback(() => <SwapHeaderRightActionContainer />, []);

  const onSwapLimit = useCallback(() => {
    Dialog.confirm({
      icon: 'InfoCircleOutline',
      showCancelButton: false,
      onConfirmText: intl.formatMessage({
        id: ETranslations.swap_page_limit_dialog_button,
      }),
      title: intl.formatMessage({
        id: ETranslations.swap_page_limit_dialog_title,
      }),
      description: intl.formatMessage({
        id: ETranslations.swap_page_limit_dialog_content,
      }),
    });
  }, [intl]);
  return (
    <XStack justifyContent="space-between">
      <XStack gap="$5">
        <SizableText size="$headingLg" userSelect="none">
          {intl.formatMessage({ id: ETranslations.swap_page_swap })}
        </SizableText>

        <XStack opacity={0.5} gap="$1" onPress={onSwapLimit}>
          <SizableText size="$headingLg" userSelect="none">
            {intl.formatMessage({ id: ETranslations.swap_page_limit })}
          </SizableText>
          <Badge badgeSize="sm" badgeType="default">
            {intl.formatMessage({ id: ETranslations.coming_soon })}
          </Badge>
        </XStack>
      </XStack>
      {headerRight()}
    </XStack>
  );
};

export default memo(SwapHeaderContainer);
