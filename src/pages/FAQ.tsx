import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const faqs = [
  {
    q: "Lovable ক্রেডিট কী?",
    a: "Lovable ক্রেডিট হলো Lovable প্ল্যাটফর্মে ব্যবহারযোগ্য ক্রেডিট যা দিয়ে আপনি AI-পাওয়ার্ড ওয়েব অ্যাপ তৈরি করতে পারবেন।",
  },
  {
    q: "কিভাবে ক্রেডিট কিনবো?",
    a: "আমাদের ওয়েবসাইটের মূল্য তালিকা থেকে আপনার পছন্দের প্যাকেজ বেছে নিন, পেমেন্ট সম্পন্ন করুন এবং আপনার Lovable অ্যাকাউন্টে ক্রেডিট যোগ হয়ে যাবে।",
  },
  {
    q: "ক্রেডিট পেতে কতক্ষণ সময় লাগে?",
    a: "সাধারণত পেমেন্ট নিশ্চিত হওয়ার ৫-৩০ মিনিটের মধ্যে ক্রেডিট ডেলিভারি হয়। ব্যস্ত সময়ে সর্বোচ্চ ১ ঘণ্টা লাগতে পারে।",
  },
  {
    q: "কোন পেমেন্ট মেথড সাপোর্ট করেন?",
    a: "আমরা বিকাশ, নগদ, রকেট এবং ক্রিপ্টোকারেন্সি (USDT) সাপোর্ট করি।",
  },
  {
    q: "পেমেন্টের পর ক্রেডিট না পেলে কী করবো?",
    a: "অর্ডার ট্র্যাক পেজ থেকে আপনার অর্ডারের স্ট্যাটাস চেক করুন। সমস্যা থাকলে আমাদের সাপোর্টে যোগাযোগ করুন।",
  },
  {
    q: "ক্রেডিটের মেয়াদ আছে কি?",
    a: "না, আমাদের মাধ্যমে কেনা ক্রেডিটের কোনো মেয়াদ নেই। Lovable প্ল্যাটফর্মের নিজস্ব নীতি অনুযায়ী এটি পরিবর্তন হতে পারে।",
  },
];

const FAQ = () => {
  const [search, setSearch] = useState("");

  const filtered = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(search.toLowerCase()) ||
      faq.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl px-4 pt-28 pb-16 md:pt-32">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 text-center">
          সচরাচর জিজ্ঞাসা
        </h1>
        <p className="text-muted-foreground text-center mb-8">আপনার সাধারণ প্রশ্নের উত্তর</p>

        <div className="relative mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="প্রশ্ন খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 glass border-border/30 focus-visible:ring-primary/50"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">কোনো ফলাফল পাওয়া যায়নি</p>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {filtered.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass rounded-xl px-5 border-none">
                <AccordionTrigger className="text-foreground font-medium text-left py-4 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
