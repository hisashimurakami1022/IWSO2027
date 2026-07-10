import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

export function SubmissionConfirmationEmail({
  title,
  conferenceName,
}: {
  title: string;
  conferenceName: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{conferenceName} - Submission received</Preview>
      <Body style={{ fontFamily: "sans-serif", padding: "24px" }}>
        <Container>
          <Heading as="h2">Submission received</Heading>
          <Text>
            This is the {conferenceName} organizing committee. We have received your abstract
            submission:
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: "16px" }}>{title}</Text>
          <Text>
            We will notify you of the review outcome by email before the notification date. You
            may continue to edit your submission until the submission deadline.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
