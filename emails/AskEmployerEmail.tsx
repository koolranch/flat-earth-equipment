import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Link,
  Section,
  Hr,
} from '@react-email/components';

export interface AskEmployerEmailProps {
  employeeName: string;
  employerName: string;
  message?: string;
  purchaseUrl: string;
}

export default function AskEmployerEmail({
  employeeName,
  employerName,
  message,
  purchaseUrl,
}: AskEmployerEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {employeeName} is requesting forklift certification — review and purchase in one click.
      </Preview>
      <Body
        style={{
          backgroundColor: '#f8fafc',
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: 32,
            margin: '24px auto',
            maxWidth: 520,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Header */}
          <Section style={{ textAlign: 'center', marginBottom: 24 }}>
            <Heading
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#0F172A',
                margin: '0 0 8px 0',
              }}
            >
              Forklift certification request
            </Heading>
            <Text style={{ fontSize: 16, color: '#64748B', margin: 0 }}>
              Flat Earth Safety
            </Text>
          </Section>

          {/* Opener */}
          <Section style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 16,
                color: '#334155',
                lineHeight: 1.6,
                margin: '0 0 16px 0',
              }}
            >
              Hi {employerName},
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#334155',
                lineHeight: 1.6,
                margin: '0 0 16px 0',
              }}
            >
              <strong style={{ color: '#0F172A' }}>{employeeName}</strong> has
              requested that you purchase their OSHA forklift operator
              certification through Flat Earth Safety.
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#334155',
                lineHeight: 1.6,
                margin: '0 0 8px 0',
              }}
            >
              <strong style={{ color: '#0F172A' }}>$49 one-time</strong> — OSHA
              forklift operator certification. No subscription. Lifetime course
              access plus a free 3-year theory refresher.
            </Text>
          </Section>

          {/* Employee message */}
          {message && (
            <Section
              style={{
                background: '#f1f5f9',
                borderLeft: '3px solid #F76511',
                borderRadius: '0 8px 8px 0',
                padding: '12px 16px',
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: '#64748B',
                  fontWeight: '600',
                  margin: '0 0 6px 0',
                }}
              >
                Message from {employeeName}:
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: '#334155',
                  lineHeight: 1.6,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message}
              </Text>
            </Section>
          )}

          {/* CTA */}
          <Section style={{ textAlign: 'center', marginBottom: 24 }}>
            <Link
              href={purchaseUrl}
              style={{
                display: 'inline-block',
                padding: '12px 28px',
                backgroundColor: '#F76511',
                color: '#ffffff',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: 16,
              }}
            >
              Review and purchase →
            </Link>
          </Section>

          {/* What's included */}
          <Section style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                color: '#64748B',
                fontWeight: '600',
                margin: '0 0 8px 0',
              }}
            >
              What your employee gets:
            </Text>
            {[
              'Interactive OSHA-compliant forklift operator course',
              'Module quizzes + proctored final exam',
              'QR-verifiable digital certificate upon passing',
              'Lifetime access + free 3-year refresher',
            ].map((item) => (
              <Text
                key={item}
                style={{ fontSize: 14, color: '#64748B', margin: '0 0 4px 0' }}
              >
                • {item}
              </Text>
            ))}
          </Section>

          <Hr
            style={{
              border: 'none',
              borderTop: '1px solid #E2E8F0',
              margin: '24px 0',
            }}
          />

          {/* Footer */}
          <Section>
            <Text
              style={{
                fontSize: 12,
                color: '#94A3B8',
                textAlign: 'center',
                margin: '0 0 8px 0',
              }}
            >
              This email was sent at {employeeName}&apos;s request. If you
              don&apos;t recognize this person, you can ignore this email.
            </Text>
            <Text
              style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', margin: 0 }}
            >
              Flat Earth Safety — Modern Forklift Operator Training
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
