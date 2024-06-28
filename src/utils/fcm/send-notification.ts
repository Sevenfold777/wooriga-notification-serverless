import { messaging as FCM } from 'firebase-admin';
import { SendNotifcationParamType } from './send-notification.type';

export async function sendNotification({
  tokens,
  title,
  body,
  screen,
  param,
}: SendNotifcationParamType): Promise<boolean> {
  try {
    const tokensNotNull = tokens.filter((token) => Boolean(token));

    if (tokensNotNull.length === 0) {
      console.warn('No token to send exist.');
      return true;
    }

    const res = await FCM().sendEachForMulticast({
      tokens: tokensNotNull,
      notification: {
        title,
        body,
      },
      data: {
        ...(screen && { screen }),
        ...(param && { param: JSON.stringify(param) }),
      },
      apns: { payload: { aps: { sound: 'default' } } },
      android: {
        priority: 'high',
        notification: {
          title,
          body,
          priority: 'high',
          icon: 'default',
          channelId: '500',
          sound: 'default',
        },
      },
    });

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
