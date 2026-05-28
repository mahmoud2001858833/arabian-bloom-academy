const PaymentOverlay = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      <h1 className="text-white text-4xl md:text-6xl font-bold text-center px-6">
        يرجى دفع المبلغ المطلوب
      </h1>
    </div>
  );
};

export default PaymentOverlay;