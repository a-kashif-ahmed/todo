import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";

import Footer from "@/components/landing/Footer";
import Problem from "@/components/landing/Problem";
import BeforeAfter from "@/components/landing/BeforeAfter";
import WhyFlowLens from "@/components/landing/WhyFlowLens";
import CallTA from "@/components/landing/CallTA";
import Solution from "@/components/landing/Solution";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Problem/>
      <Solution/>  
      <BeforeAfter/>
      <WhyFlowLens/>
      <CallTA/>
      

      <Footer />
    </>
  );
}