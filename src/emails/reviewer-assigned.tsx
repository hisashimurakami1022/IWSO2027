import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

export function ReviewerAssignedEmail({
  title,
  conferenceName,
}: {
  title: string;
  conferenceName: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{conferenceName} - New submission assigned for review</Preview>
      <Body style={{ fontFamily: "sans-serif", padding: "24px" }}>
        <Container>
          <Heading as="h2">New submission assigned</Heading>
          <Text>
            You have been assigned to review the following submission for {conferenceName}:
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: "16px" }}>{title}</Text>
          <Text>
            Please sign in to the system to complete your review before the review deadline.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
