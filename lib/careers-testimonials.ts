export type Testimonial = {
  name: string;
  role: string;
  photo: string;
  body: string[];
  bg: "yellow" | "gray";
  placement?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Ron D.",
    role: "from Video Editor to Creative Agency Owner",
    photo: "/images/Ron%20David.png",
    bg: "yellow",
    placement: "md:row-span-2",
    body: [
      "My experience at JAZA Media played a significant role in my professional growth and development. It became one of the strongest foundations in building my portfolio and enhancing my credibility when working with clients, especially as I started taking on more real-world projects.",
      "During my time there, I was able to sharpen my video editing skills while also gaining a deeper understanding of branding, content strategy, and the importance of creating visuals that truly align with a brand's identity and message. I learned how to be more intentional with every piece of content I create—not just making it visually appealing, but also making sure it serves a purpose and delivers results.",
      "Beyond the technical side, JAZA Media also helped me develop a stronger creative mindset, improve my work ethic, and become more adaptable in a fast-paced environment. I gained valuable experience in handling feedback, collaborating with a team, and continuously improving my output to meet higher standards.",
    ],
  },
  {
    name: "Samantha M.",
    role: "from PR Assistant to Full-time Paid Content Creator",
    photo: "/images/Samantha%20Manuel.png",
    bg: "gray",
    body: [
      "Since day one, ang dami nang opportunities and blessings na binigay sa akin, and I'm truly, truly grateful for all of it.",
      "Sobrang na-appreciate ko rin how you always go the extra mile for us. Super spoiled kami sa inyo, even though hybrid setup tayo, you still make sure we feel appreciated through gifts like clothes and so much more. It really shows how much you care beyond just work.",
      "Honestly, this was never just a job. Ms. Bela and Sir Jaza made us feel like we're part of a real family while also pushing us to grow and achieve our individual goals in life. JAZA Media became a big part of my journey, especially in helping me figure out what I truly want for my career.",
    ],
  },
  {
    name: "James N.",
    role: "from Video Editor Intern to having own International Clients",
    photo: "/images/James%20Nunez.png",
    bg: "yellow",
    body: [
      "During my journey with JAZA Media, I learned how to edit faster and more efficiently while still keeping good quality. I also improved my basic editing skills and learned how to adjust my editing style for different niches or types of content.",
      "One of my biggest takeaways was time management and discipline. Because of the editing calendar and deadlines, I learned how to stay organized, manage my time better, and make sure all deliverables were complete and submitted on time.",
    ],
  },
  {
    name: "Allyson A.",
    role: "from Virtual Assistant Intern to CNM Marketing Director",
    photo: "/images/Allyson%20Abad.png",
    bg: "gray",
    placement: "md:col-span-2",
    body: [
      "You're truly one of the biggest inspirations for me and my partner, and I just want to say how grateful I am for everything you've shared with us. Being an intern under your supervision was such a meaningful and unforgettable experience. You didn't just teach skills—you really helped shape how I think, work, and grow in this field.",
      "I'm so thankful for the opportunity to be part of JAZA Media. The lessons, guidance, and real experiences I gained during my time there are things I still carry with me and apply in my career up to now. It honestly made a huge impact on who I am professionally today.",
      "I'll always appreciate the support, patience, and trust you gave me. Hoping to see you again soon! More power to JAZA Media and everything you continue to build and inspire. Thank you so much for everything. Luv you so much!",
    ],
  },
];
