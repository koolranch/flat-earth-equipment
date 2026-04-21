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

interface ExamUnlockedEmailProps {
  inviteToken: string;
  employerName: string;
  employeeName?: string;
  claimUrl: string;
  appDeepLink: string;
}

export default function ExamUnlockedEmail({
  inviteToken,
  employerName,
  employeeName,
  claimUrl,
  appDeepLink,
}: ExamUnlockedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your OSHA forklift exam is unlocked</Preview>
      <Body
        style={{
          backgroundColor: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
          <Section style={{ textAlign: 'center', marginBottom: 24 }}>
            <Heading
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#0F172A',
                margin: '0 0 8px 0',
              }}
            >
              Your exam is unlocked
            </Heading>
            <Text
              style={{
                fontSize: 16,
                color: '#64748B',
                margin: 0,
              }}
            >
              Flat Earth Safety
            </Text>
          </Section>

          <Section style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 16,
                color: '#334155',
                lineHeight: 1.5,
                margin: '0 0 16px 0',
              }}
            >
              {employeeName ? `Hi ${employeeName},` : 'Hi,'}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#334155',
                lineHeight: 1.5,
                margin: '0 0 24px 0',
              }}
            >
              <strong style={{ color: '#0F172A' }}>{employerName}</strong> has covered your
              OSHA-compliant forklift operator certification. Here&rsquo;s your access code.
            </Text>
          </Section>

          <Section
            style={{
              textAlign: 'center',
              marginBottom: 24,
              padding: '20px 16px',
              background: '#F1F5F9',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: '#64748B',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
                margin: '0 0 8px 0',
              }}
            >
              Access code
            </Text>
            <Text
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                fontSize: 20,
                fontWeight: 700,
                color: '#0F172A',
                letterSpacing: 1,
                wordBreak: 'break-all',
                margin: 0,
              }}
            >
              {inviteToken}
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', marginBottom: 24 }}>
            <Link
              href={appDeepLink}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#F76511',
                color: '#ffffff',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              Open in Forklift Certified app
            </Link>
          </Section>

          <Section style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                color: '#64748B',
                fontWeight: 600,
                margin: '0 0 8px 0',
              }}
            >
              How to take your exam:
            </Text>
            <Text style={{ fontSize: 14, color: '#64748B', margin: '0 0 4px 0' }}>
              1. Open the Forklift Certified app.
            </Text>
            <Text style={{ fontSize: 14, color: '#64748B', margin: '0 0 4px 0' }}>
              2. Tap <strong>Final Exam</strong>.
            </Text>
            <Text style={{ fontSize: 14, color: '#64748B', margin: '0 0 4px 0' }}>
              3. Tap <strong>Employer paying? Enter invite code</strong>.
            </Text>
            <Text style={{ fontSize: 14, color: '#64748B', margin: '0 0 16px 0' }}>
              4. Paste the access code above.
            </Text>
            <Text style={{ fontSize: 14, color: '#64748B', margin: '0 0 4px 0' }}>
              Or tap this link on your phone to open the app with the code pre-filled:
            </Text>
            <Text style={{ fontSize: 13, color: '#334155', margin: '0 0 16px 0' }}>
              <Link href={claimUrl} style={{ color: '#F76511', textDecoration: 'underline' }}>
                {claimUrl}
              </Link>
            </Text>
          </Section>

          <Hr
            style={{
              border: 'none',
              borderTop: '1px solid #E2E8F0',
              margin: '24px 0',
            }}
          />

          <Section>
            <Text
              style={{
                fontSize: 12,
                color: '#94A3B8',
                textAlign: 'center',
                margin: '0 0 8px 0',
              }}
            >
              If you weren&rsquo;t expecting this email, please ignore it.
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: '#94A3B8',
                textAlign: 'center',
                margin: 0,
              }}
            >
              Flat Earth Safety &mdash; Modern Forklift Operator Training
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
