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

interface SeatInviteEmailProps {
  claimUrl: string;
  courseTitle: string;
  invitedBy?: string;
}

export default function SeatInviteEmail({ 
  claimUrl, 
  courseTitle, 
  invitedBy 
}: SeatInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Claim your training seat - {courseTitle}</Preview>
      <Body style={{ 
        backgroundColor: '#f8fafc', 
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        margin: 0,
        padding: 0
      }}>
        <Container style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 32,
          margin: '24px auto',
          maxWidth: 520,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Header */}
          <Section style={{ textAlign: 'center', marginBottom: 24 }}>
            <Heading style={{ 
              fontSize: 24, 
              fontWeight: 'bold',
              color: '#0F172A',
              margin: '0 0 8px 0'
            }}>
              You're invited to training
            </Heading>
            <Text style={{ 
              fontSize: 16,
              color: '#64748B',
              margin: 0
            }}>
              Flat Earth Safety
            </Text>
          </Section>

          {/* Course Information */}
          <Section style={{ marginBottom: 24 }}>
            <Text style={{ 
              fontSize: 16,
              color: '#334155',
              marginTop: 0,
              marginBottom: 16
            }}>
              Course: <strong style={{ color: '#0F172A' }}>{courseTitle}</strong>
            </Text>
            
            {invitedBy && (
              <Text style={{ 
                fontSize: 14,
                color: '#64748B',
                margin: '0 0 16px 0'
              }}>
                Invited by: {invitedBy}
              </Text>
            )}
            
            <Text style={{ 
              fontSize: 16,
              color: '#334155',
              lineHeight: 1.5,
              margin: '0 0 24px 0'
            }}>
              You've been assigned OSHA-compliant forklift operator training. This interactive course includes demos, micro-quizzes, and a final exam with QR-verifiable certification.
            </Text>
          </Section>

          {/* Call to Action */}
          <Section style={{ textAlign: 'center', marginBottom: 24 }}>
            <Link 
              href={claimUrl}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#F76511',
                color: '#ffffff',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: 16
              }}
            >
              Claim Your Seat
            </Link>
          </Section>

          {/* Course Features */}
          <Section style={{ marginBottom: 24 }}>
            <Text style={{ 
              fontSize: 14,
              color: '#64748B',
              fontWeight: '600',
              margin: '0 0 8px 0'
            }}>
              What's included:
            </Text>
            <Text style={{ 
              fontSize: 14,
              color: '#64748B',
              margin: '0 0 4px 0'
            }}>
              • Interactive demos and simulations
            </Text>
            <Text style={{ 
              fontSize: 14,
              color: '#64748B',
              margin: '0 0 4px 0'
            }}>
              • Quick knowledge assessments
            </Text>
            <Text style={{ 
              fontSize: 14,
              color: '#64748B',
              margin: '0 0 4px 0'
            }}>
              • Final certification exam
            </Text>
            <Text style={{ 
              fontSize: 14,
              color: '#64748B',
              margin: '0 0 16px 0'
            }}>
              • QR-verifiable certificate upon completion
            </Text>
          </Section>

          <Hr style={{ 
            border: 'none',
            borderTop: '1px solid #E2E8F0',
            margin: '24px 0'
          }} />

          {/* Footer */}
          <Section>
            <Text style={{ 
              fontSize: 12,
              color: '#94A3B8',
              textAlign: 'center',
              margin: '0 0 8px 0'
            }}>
              If you weren't expecting this invitation, please ignore this email.
            </Text>
            <Text style={{ 
              fontSize: 12,
              color: '#94A3B8',
              textAlign: 'center',
              margin: 0
            }}>
              Flat Earth Safety - Modern Forklift Operator Training
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
