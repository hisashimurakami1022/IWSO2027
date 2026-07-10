import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

export function ReviewReminderEmail({
  title,
  conferenceName,
}: {
  title: string;
  conferenceName: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{conferenceName} - Reminder: review pending</Preview>
      <Body style={{ fontFamily: "sans-serif", padding: "24px" }}>
        <Container>
          <Heading as="h2">Review reminder</Heading>
          <Text>
            This is a reminder that your review is still pending for the following {conferenceName}{" "}
            submission:
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: "16px" }}>{title}</Text>
          <Text>Please sign in to the system to complete your review before the deadline.</Text>
        </Container>
      </Body>
    </Html>
  );
}
