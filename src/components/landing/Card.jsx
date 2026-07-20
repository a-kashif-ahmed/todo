export default function Card(){
    return (
         <div
                
                className="m-20 group rounded-3xl border border-white/10 bg-[#161222] p-8 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-300/40 hover:shadow-[0_0_40px_rgba(249,115,22,.15)]"
              >

                

                <h3 className="mt-8 text-2xl font-semibold">

                  Debugging workflows shouldn't feel like detective work

                </h3>

                <p className="mt-4 leading-8 text-gray-400">

                  Your automation suddenly stops working.

Customers stop receiving emails.

Orders stop syncing.

Your AI agent starts returning errors.

                </p>

              </div>
    );
}