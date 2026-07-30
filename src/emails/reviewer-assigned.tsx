import { Body, Container, Head, Heading, Html, Link, Preview, Text } from "@react-email/components";

export function ReviewerAssignedEmail({
  submissions,
  conferenceName,
  reviewQueueUrl,
}: {
  submissions: { title: string; url: string }[];
  conferenceName: string;
  reviewQueueUrl: string;
}) {
  const plural = submissions.length > 1;
  return (
    <Html>
      <Head />
      <Preview>{`${conferenceName} - ${submissions.length} submission${plural ? "s" : ""} assigned for review`}</Preview>
      <Body style={{ fontFamily: "sans-serif", padding: "24px" }}>
        <Container>
          <Heading as="h2">
            New submission{plural ? "s" : ""} assigned
          </Heading>
          <Text>
            You have been assigned to review the following submission{plural ? "s" : ""} for{" "}
            {conferenceName}:
          </Text>
          {submissions.map((s) => (
            <Text key={s.url} style={{ fontWeight: "bold", fontSize: "16px", margin: "4px 0" }}>
              &bull; <Link href={s.url}>{s.title}</Link>
            </Text>
          ))}
          <Text>
            Please sign in to the system to complete your review{plural ? "s" : ""} before the
            review deadline.
          </Text>
          <Text>
            <Link href={reviewQueueUrl} style={{ fontWeight: "bold" }}>
              Go to your Review Queue
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
