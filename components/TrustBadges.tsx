import { Shield, Award, Clock, Users } from "lucide-react";

export default function TrustBadges() {
  return (
    <section className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="space-y-2">
          <Shield className="h-8 w-8 text-canyon-rust mx-auto" />
          <h3 className="font-semibold text-sm">OSHA Compliant</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            CFR 1910.178(l) certified training
          </p>
        </div>
        
        <div className="space-y-2">
          <Award className="h-8 w-8 text-canyon-rust mx-auto" />
          <h3 className="font-semibold text-sm">Instant Certificate</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Printable wallet card included
          </p>
        </div>
        
        <div className="space-y-2">
          <Clock className="h-8 w-8 text-canyon-rust mx-auto" />
          <h3 className="font-semibold text-sm">90-Min Average</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Complete at your own pace
          </p>
        </div>
        
        <div className="space-y-2">
          <Users className="h-8 w-8 text-canyon-rust mx-auto" />
          <h3 className="font-semibold text-sm">10,000+ Certified</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Trusted by operators nationwide
          </p>
        </div>
      </div>
    </section>
  );
} 