import { messaging as FCM } from "firebase-admin";

export async function sendNotification({
  tokens,
  title,
  body,
  screen,
  param,
}: SendNotifcationType): Promise<boolean> {
  try {
    const tokensNotNull = tokens.filter((token) => token);

    if (tokensNotNull.length === 0) {
      throw new Error("No valid token exist.");
    }

    await FCM().sendEachForMulticast({
      tokens: tokensNotNull,
      data: {
        ...(screen && { screen }),
        ...(param && { param }),
      },
      apns: { payload: { aps: { sound: "default" } } },
      android: {
        priority: "high",
        notification: {
          title,
          body,
          priority: "high",
          icon: "default",
          channelId: "500",
          sound: "default",
        },
      },
    });

    return true;
  } catch (e) {
    console.error(e.message);
    return false;
  }
}

type SendNotifcationType = {
  tokens: string[];
  title: string;
  body: string;
  screen?: string;
  param?: string;
};
