import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

export function ReviewerAssignedEmail({
  titles,
  conferenceName,
}: {
  titles: string[];
  conferenceName: string;
}) {
  const plural = titles.length > 1;
  return (
    <Html>
      <Head />
      <Preview>{`${conferenceName} - ${titles.length} submission${plural ? "s" : ""} assigned for review`}</Preview>
      <Body style={{ fontFamily: "sans-serif", padding: "24px" }}>
        <Container>
          <Heading as="h2">
            New submission{plural ? "s" : ""} assigned
          </Heading>
          <Text>
            You have been assigned to review the following submission{plural ? "s" : ""} for{" "}
            {conferenceName}:
          </Text>
          {titles.map((title) => (
            <Text key={title} style={{ fontWeight: "bold", fontSize: "16px", margin: "4px 0" }}>
              &bull; {title}
            </Text>
          ))}
          <Text>
            Please sign in to the system to complete your review{plural ? "s" : ""} before the
            review deadline.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
