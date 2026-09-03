import { Body, Container, Head, Heading, Html, Link, Preview, Text } from "@react-email/components";

export function SubmissionConfirmationEmail({
  title,
  conferenceName,
  submissionUrl,
  submissionCode,
}: {
  title: string;
  conferenceName: string;
  submissionUrl: string;
  submissionCode?: string | null;
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
          {submissionCode && (
            <Text>
              Your submission ID is <strong>{submissionCode}</strong>. Please refer to this ID in
              any correspondence about your submission.
            </Text>
          )}
          <Text>
            We will notify you of the review outcome by email before the notification date. You
            may continue to edit your submission until the submission deadline.
          </Text>
          <Text>
            <Link href={submissionUrl} style={{ fontWeight: "bold" }}>
              View your submission
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
