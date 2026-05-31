import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type ContactEmailProps = {
  senderEmail: string;
  message: string;
};

export default function ContactEmail({
  senderEmail,
  message,
}: ContactEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`New message from ${senderEmail}`}</Preview>
      <Body style={{ backgroundColor: "#f3f4f6", fontFamily: "sans-serif" }}>
        <Container>
          <Section
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              margin: "40px 0",
              padding: "16px 40px",
            }}
          >
            <Heading as="h2" style={{ lineHeight: "1.25" }}>
              New message from your website
            </Heading>
            <Text>
              <strong>From:</strong> {senderEmail}
            </Text>
            <Hr />
            <Text style={{ whiteSpace: "pre-wrap" }}>{message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
