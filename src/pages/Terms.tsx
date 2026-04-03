import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container max-w-3xl px-4 pt-28 pb-16 md:pt-32">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 text-center">
        সেবার শর্তাবলী
      </h1>
      <p className="text-muted-foreground text-center mb-10">সর্বশেষ আপডেট: ১ এপ্রিল, ২০২৬</p>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">১. সেবার বিবরণ</h2>
          <p>
            Lovable Credits বাংলাদেশের গ্রাহকদের জন্য Lovable প্ল্যাটফর্মের ক্রেডিট পুনঃবিক্রয় সেবা প্রদান করে।
            আমরা সরাসরি Lovable-এর সাথে সম্পর্কিত নই, তবে তাদের প্ল্যাটফর্মে ব্যবহারযোগ্য ক্রেডিট সরবরাহ করি।
          </p>
        </section>

        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">২. অর্ডার ও পেমেন্ট</h2>
          <p>
            সকল অর্ডার পেমেন্ট নিশ্চিত হওয়ার পর প্রসেস করা হয়। ভুল তথ্য প্রদানের কারণে বিলম্ব বা
            সমস্যার জন্য আমরা দায়ী নই। সঠিক ইমেইল ও ট্রানজেকশন আইডি প্রদান করুন।
          </p>
        </section>

        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">৩. ডেলিভারি</h2>
          <p>
            সাধারণত ৫-৩০ মিনিটের মধ্যে ক্রেডিট ডেলিভারি হয়। বিশেষ পরিস্থিতিতে সর্বোচ্চ ২৪ ঘণ্টা সময়
            লাগতে পারে। ডেলিভারি সম্পন্ন হলে আপনাকে জানানো হবে।
          </p>
        </section>

        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">৪. দায়বদ্ধতার সীমাবদ্ধতা</h2>
          <p>
            Lovable প্ল্যাটফর্মের নীতি পরিবর্তন, সার্ভার সমস্যা বা অন্য কোনো তৃতীয় পক্ষের কারণে
            সৃষ্ট সমস্যার জন্য আমরা দায়ী নই।
          </p>
        </section>
      </div>
    </div>
    <Footer />
  </div>
);

export default Terms;
