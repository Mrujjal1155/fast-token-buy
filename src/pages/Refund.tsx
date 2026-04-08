import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Refund = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="ফেরত নীতি (Refund Policy) — Lovable Credits"
      description="LovableCredit.com এর রিফান্ড পলিসি। কখন ও কিভাবে ফেরত পাবেন, শর্তাবলী ও প্রক্রিয়া জানুন।"
      path="/refund"
      keywords="lovable credit refund, ফেরত নীতি, lovable credit return policy, lovable credit money back"
    />
    <Navbar />
    <div className="container max-w-3xl px-4 pt-28 pb-16 md:pt-32">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 text-center">
        ফেরত নীতি
      </h1>
      <p className="text-muted-foreground text-center mb-10">সর্বশেষ আপডেট: ১ এপ্রিল, ২০২৬</p>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">১. ফেরতের শর্তাবলী</h2>
          <p>
            ক্রেডিট ডেলিভারি হওয়ার পর ফেরত প্রদান সম্ভব নয়। তবে যদি কোনো কারণে ক্রেডিট
            ডেলিভারি করা না যায়, তাহলে সম্পূর্ণ অর্থ ফেরত দেওয়া হবে।
          </p>
        </section>

        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">২. ফেরতের প্রক্রিয়া</h2>
          <p>
            ফেরতের জন্য আমাদের সাপোর্ট টিমে যোগাযোগ করুন আপনার অর্ডার আইডি সহ।
            ফেরত অনুমোদিত হলে ৩-৫ কার্যদিবসের মধ্যে আপনার পেমেন্ট মেথডে ফেরত দেওয়া হবে।
          </p>
        </section>

        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">৩. বিরোধ নিষ্পত্তি</h2>
          <p>
            কোনো বিরোধের ক্ষেত্রে প্রথমে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।
            আমরা সবসময় গ্রাহক সন্তুষ্টিকে অগ্রাধিকার দিই।
          </p>
        </section>

        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">৪. যোগাযোগ</h2>
          <p>
            ফেরত সংক্রান্ত যেকোনো প্রশ্নের জন্য আমাদের ইমেইলে যোগাযোগ করুন:
            support@lovablecredits.com
          </p>
        </section>
      </div>
    </div>
    <Footer />
  </div>
);

export default Refund;
