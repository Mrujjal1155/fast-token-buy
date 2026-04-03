import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container max-w-3xl px-4 pt-28 pb-16 md:pt-32">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 text-center">
        গোপনীয়তা নীতি
      </h1>
      <p className="text-muted-foreground text-center mb-10">সর্বশেষ আপডেট: ১ এপ্রিল, ২০২৬</p>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">১. তথ্য সংগ্রহ</h2>
          <p>
            আমরা আপনার অর্ডারের জন্য প্রয়োজনীয় ন্যূনতম তথ্য সংগ্রহ করি — যেমন ইমেইল ঠিকানা,
            ট্রানজেকশন আইডি এবং পেমেন্ট সংক্রান্ত তথ্য।
          </p>
        </section>

        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">২. তথ্যের ব্যবহার</h2>
          <p>
            সংগৃহীত তথ্য শুধুমাত্র অর্ডার প্রসেসিং, ক্রেডিট ডেলিভারি এবং গ্রাহক সহায়তার
            জন্য ব্যবহৃত হয়। আমরা কোনো তৃতীয় পক্ষের কাছে আপনার তথ্য বিক্রি করি না।
          </p>
        </section>

        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">৩. তথ্যের নিরাপত্তা</h2>
          <p>
            আমরা আপনার তথ্য সুরক্ষিত রাখতে শিল্প-মানের নিরাপত্তা ব্যবস্থা ব্যবহার করি।
            তবে ইন্টারনেটে ১০০% নিরাপত্তা গ্যারান্টি দেওয়া সম্ভব নয়।
          </p>
        </section>

        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">৪. কুকি ও ট্র্যাকিং</h2>
          <p>
            আমাদের ওয়েবসাইট সেবার মান উন্নত করতে প্রয়োজনীয় কুকি ব্যবহার করতে পারে।
            আপনি আপনার ব্রাউজার সেটিংস থেকে কুকি নিয়ন্ত্রণ করতে পারেন।
          </p>
        </section>
      </div>
    </div>
    <Footer />
  </div>
);

export default Privacy;
