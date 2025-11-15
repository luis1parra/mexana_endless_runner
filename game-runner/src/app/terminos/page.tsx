"use client";

import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

export default function TerminosPage() {
  const Section = ({ index }: { index: number }) => (
    <section className="mt-6">
      <h4 className="text-[var(--cpdblue)] text-[18px] font-bold md:text-[24px]">
        {index}. Lorem ipsum dolor sit amet consectetur.
      </h4>
      <div className="mt-3 space-y-3 text-[15px] text-justify leading-none font-light text-black">
        <p>
          Lorem ipsum dolor sit amet consectetur. Condimentum vestibulum viverra
          pellentesque urna ullamcorper sem. Et ornare quis a dignissim aliquam
          convallis ut purus lacinia. Volutpat eget tellus sed proin nulla diam sed
          sagittis. Eti risus fermentum fermentum dui integer. Fringilla sapien
          quam sed aliquam tellus felis. Eget integer volutpat pharetra urna
          adipiscing id elit. Quis auctor lobortis rutrum at. Ut potenti turpis ut
          lacus lacus auctor ac velit pharetra. Mauris accumsan sem nullam
          commodo. Semper sit elementum in augue dui. At at ultricies pellentesque
          adipiscing feugiat tortor diam. Uma dui neque ultrices non vestibulum
          elementum. Ultricies consectetur praesent orci faucibus elementum.
        </p>
        <p>
          Lorem tellus tristique fermentum ornare amet orci enim lectus at. Nisl
          nullam a sit mauris. At scelerisque porttitor phasellus tincidunt eget et.
          Montes suscipit potenti ac commodo ac nunc. Quam urna risus sagittis eu
          et nisl at ullamcorper. Commodo adipiscing nunc scelerisque ut ultrices.
        </p>
      </div>
    </section>
  );

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0B1E52]">
      <main className="flex mx-auto w-full flex-1">
        <section className="w-full bg-white relative">
          <div className="bg-[var(--cpdblue)] px-10 py-5">
            <Header activeHref="/terminos" />
          </div>
          

          <div className="relative">
            <div className="mx-auto w-full px-4 py-6 md:px-12 md:py-8">
              <h3 className="text-center text-[20px] font-semibold text-[var(--cplblue)] md:text-[22px]">
                Términos y condiciones
              </h3>
              <h1 className="text-center mt-2 text-[40px] md:text-[52px] lg:text-[56px] font-black leading-[1.1] tracking-tight text-[var(--cpdblue)] drop-shadow-md">
                Conoce los términos y condiciones de
                <br />
                Fresh Game
              </h1>

              <div className="text-black mt-10 lg:mt-20">
                <Section index={1} />
                <Section index={2} />
                <Section index={3} />

                <section className="mt-6">
                  <h4 className="text-[var(--cpdblue)] text-[18px] font-bold md:text-[24px]">
                    4. Lorem ipsum dolor sit amet consectetur.
                  </h4>
                  <div className="mt-3 space-y-3 text-[15px] text-justify leading-none font-light text-black">
                    <p>
                      1. Fringilla sapien quam sed aliquam tellus felis. Eget
                      integer volutpat pharetra urna adipiscing id elit.
                    </p>
                    <p>
                      2. Quis auctor lobortis rutrum at. Ut potenti turpis ut
                      lacus lacus auctor ac velit pharetra. Mauris accumsan sem
                      nullam commodo.
                    </p>
                    <p>
                      3. Semper sit elementum in augue dui. At at ultricies
                      pellentesque adipiscing feugiat tortor diam.
                    </p>
                    <p>
                      4. Uma dui neque ultrices non vestibulum elementum.
                      Ultricies consectetur praesent orci faucibus elementum.
                    </p>
                  </div>
                </section>

                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    className="cursor-pointer rounded-full bg-[var(--cpdblue)] px-10 py-4 text-base font-semibold text-white shadow-[0_22px_44px_rgba(12,35,106,0.35)] transition hover:bg-[#1532A8]"
                  >
                    Ver más
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

