export type Contribution = {
  /** Short category shown before the paragraph, e.g. "Design". */
  label: string;
  text: string;
};

export type DevsEvent = {
  slug: string;
  title: string;
  /** When it happened, as written in the contribution log. */
  month: string;
  /** Kinds of work done, listed under the title. */
  areas: string[];
  /** Optional headline number or role, shown under the areas. */
  highlight?: string;
  /**
   * Optional 16:9 photo for the event. Drop the file into `public/events/`
   * and set this to e.g. "/events/tiforge.jpg". Leave empty for a placeholder.
   */
  image?: string;
  contributions: Contribution[];
};

export const tenure = {
  name: "Abhijith K",
  role: "Tech Team Member",
  club: "DEVS REC",
  college: "Rajalakshmi Engineering College",
  from: "September 2025",
  to: "April 2026",
};

export const events: DevsEvent[] = [
  {
    slug: "investiture-ceremony",
    title: "Devs Investiture Ceremony",
    month: "September 2025",
    areas: ["Technical", "Event"],
    contributions: [
      { label: "Technical", text: "Worked on the frontend of the game leaderboard." },
      { label: "Event", text: "On spot event volunteering." },
    ],
  },
  {
    slug: "space-odyssey-online",
    title: "Space Odyssey (Online)",
    month: "October 2025",
    areas: ["Design"],
    contributions: [
      { label: "Design", text: "Designed the PPT for the speaker interaction questions." },
    ],
  },
  {
    slug: "space-odyssey-offline",
    title: "Space Odyssey (Offline)",
    month: "October 2025",
    areas: ["Event", "Technical", "Design"],
    contributions: [
      { label: "Event", text: "Volunteered for technical support and on spot event works." },
      {
        label: "Technical",
        text: "Created the questions and deployed a quiz in Kahoot for an icebreaker session.",
      },
      { label: "Design", text: "Designed the certificates for participants." },
    ],
  },
  {
    slug: "xplorex",
    title: "XploreX (Online)",
    month: "November 2025",
    areas: ["Community", "Mentoring"],
    contributions: [
      {
        label: "Community",
        text: "Maintained community interaction for the ML domain after the event through the XploreX WhatsApp community.",
      },
      {
        label: "Mentoring",
        text: "Developed structured roadmaps for ML and cleared the doubts of participants.",
      },
    ],
  },
  {
    slug: "tiforge",
    title: "TiForge Hackathon",
    month: "January 2026",
    areas: ["Core Team", "PR & Outreach", "Design", "Content", "Event"],
    highlight: "3000+ registrations",
    contributions: [
      { label: "Role", text: "Worked in the core organising team." },
      {
        label: "PR & Outreach",
        text: "Drafted mails and contacted 100+ colleges requesting student participation. Reached out to 30+ influencers through Email and Instagram to promote the hackathon, and negotiated quotations with them for promotion reels. Brought in 3000+ registrations.",
      },
      {
        label: "Design",
        text: "Designed ID cards for participants, volunteers and organisers, ID card lanyards, the jury introduction PPT, the room layout, Unstop banners and posters.",
      },
      { label: "Event", text: "Event draft, pre-event works and on spot event works." },
      { label: "Promo Reel", text: "Acted in a promo reel." },
      {
        label: "Content",
        text: "Created content for the Unstop registration page and drafted mails for influencer promotions.",
      },
      {
        label: "PPT Shortlisting",
        text: "Shortlisted 45 teams from a total of 150 submitted PPTs.",
      },
      {
        label: "Participant Support",
        text: "Managed participant queries and doubts on Unstop.",
      },
    ],
  },
  {
    slug: "0xti-ctf",
    title: "0xTi CTF",
    month: "January 2026",
    areas: ["Core Team", "PR & Outreach", "Design", "Content"],
    highlight: "120 registrations (maximum allowed)",
    contributions: [
      { label: "Role", text: "Worked in the core organising team." },
      {
        label: "PR & Outreach",
        text: "Drafted mails and contacted 100+ colleges requesting student participation. Reached out to 30+ influencers through Email and Instagram to promote the event, and negotiated quotations with them for promotion reels. Brought in 120 registrations, the maximum allowed.",
      },
      {
        label: "Design",
        text: "Designed ID cards for participants, volunteers and organisers, ID card lanyards and Unstop banners.",
      },
      {
        label: "Content",
        text: "Created content for the Unstop registration page and drafted mails for influencer promotions.",
      },
    ],
  },
  {
    slug: "hacktivate",
    title: "Hackathons Unplugged",
    month: "January 2026",
    areas: ["Design", "Event"],
    contributions: [
      { label: "Design", text: "Designed the Instagram poster for the online webinar." },
      { label: "Event", text: "Took part in creating the event draft and flow." },
    ],
  },
  {
    slug: "ctrl-commit",
    title: "Ctrl + Commit",
    month: "January 2026",
    areas: ["Design"],
    contributions: [
      {
        label: "Design",
        text: "Helped make the PPT the speakers used to teach the participants.",
      },
    ],
  },
  {
    slug: "breach-101",
    title: "Breach 101",
    month: "January 2026",
    areas: ["Event"],
    contributions: [{ label: "Event", text: "Volunteered for on spot event works." }],
  },
  {
    slug: "technical-mun",
    title: "Technical MUN (Titanium)",
    month: "February 2026",
    areas: ["Event", "Design", "PR"],
    highlight: "Registrations filled to maximum",
    contributions: [
      {
        label: "Event",
        text: "Worked on the event planning, draft and on spot event management.",
      },
      {
        label: "Design",
        text: "Designed company placards for participants and the background display PPT.",
      },
      {
        label: "PR",
        text: "Promoted the event and increased the registration count to the maximum.",
      },
    ],
  },
  {
    slug: "terrain-conqueror",
    title: "Terrain Conqueror (Titanium)",
    month: "February 2026",
    areas: ["Pre-event", "Event"],
    contributions: [
      { label: "Pre-event", text: "Helped make the racing track." },
      { label: "Event", text: "Handled on-spot event management and managed certificates." },
    ],
  },
  // {
  //   slug: "titanium",
  //   title: "Titanium",
  //   month: "February 2026",
  //   areas: ["Design"],
  //   contributions: [
  //     {
  //       label: "Design",
  //       text: "Assisted in design works for content changes in the posters for the events Equilibira, Nourishnovate and Problem Solving.",
  //     },
  //   ],
  // },
  {
    slug: "capture-and-code",
    title: "Capture & Code",
    month: "March 2026",
    areas: ["Event", "Technical"],
    contributions: [
      { label: "Event", text: "Volunteered for on spot event works." },
      {
        label: "Technical",
        text: "Offered technical help to participants developing their websites.",
      },
    ],
  },
  {
    slug: "quizzdevix",
    title: "QuizzDevix",
    month: "March 2026",
    areas: ["Design", "Event", "Technical"],
    contributions: [
      {
        label: "Design",
        text: "Created the questions for the “Guess the Logo” icebreaker session and designed its PPT.",
      },
      { label: "Event", text: "On spot event volunteering." },
      {
        label: "Technical",
        text: "Technical support for the buzzer wiring and its proper functioning. Integrated a smart bulb into the buzzer system (and also sacrificed it TwT).",
      },
    ],
  },
  {
    slug: "clash-of-canvas",
    title: "Clash of Canvas",
    month: "April 2026",
    areas: ["SPOC", "Pre-event", "Event", "Technical", "Design"],
    highlight: "SPOC · Built the voting website",
    contributions: [
      { label: "Role", text: "SPOC for the event." },
      {
        label: "Pre-event",
        text: "Created the event draft and coordinated with the design team for the syllabus and speaker organisation.",
      },
      {
        label: "Event",
        text: "On spot event works, including helping participants with design software issues and design doubts. Managed speaker coordination.",
      },
      {
        label: "Technical",
        text: "Created and deployed an end to end website for participants to upload their designs and for the audience to vote on them.",
      },
      {
        label: "Design",
        text: "Story design for the voting website announcement, winners announcement posters, and certificates for participants and winners.",
      },
    ],
  },
  {
    slug: "devapps",
    title: "Devapps",
    month: "April 2026",
    areas: ["Design"],
    contributions: [{ label: "Design", text: "Designed an Instagram poster for the event." }],
  },
  {
    slug: "tech-carnival",
    title: "Tech Carnival",
    month: "April 2026",
    areas: ["Pre-event", "Event", "Design"],
    contributions: [
      { label: "Pre-event", text: "Helped with the participants’ gifts." },
      {
        label: "Event",
        text: "On spot volunteering, including technical support for all the booths and managing the registration desk.",
      },
      {
        label: "Design",
        text: "Designed tokens for participants and a poster displaying the various prizes to be won.",
      },
    ],
  },
  {
    slug: "devs-podcast",
    title: "The Devs Podcast",
    month: "April 2026",
    areas: ["Pre-shoot", "Event"],
    contributions: [
      {
        label: "Pre-shoot",
        text: "Worked on the planning, draft, question framing and shoot layout planning.",
      },
      { label: "Event", text: "On site volunteering and management." },
    ],
  },
  {
    slug: "film-club-ott",
    title: "Film Club OTT",
    month: "Ongoing",
    areas: ["Design", "Technical"],
    contributions: [
      {
        label: "Design",
        text: "Designed the overall look of the website and refined it using UI/UX principles for user satisfaction.",
      },
      {
        label: "Technical",
        text: "Worked on the frontend of the website and successfully deployed it.",
      },
    ],
  },
  {
    slug: "flutter-forge",
    title: "Flutter Forge Hackathon",
    month: "Event delayed",
    areas: ["SPOC", "Pre-event", "Design"],
    highlight: "SPOC",
    contributions: [
      { label: "Role", text: "SPOC of the event." },
      { label: "Pre-event", text: "Worked on the event draft, flow and agenda." },
      {
        label: "Design",
        text: "Designed a sponsorship brochure and the event draft handbook.",
      },
    ],
  },
  {
    slug: "birthday-stories",
    title: "Devs Birthday Stories",
    month: "Across the tenure",
    areas: ["Design"],
    contributions: [
      {
        label: "Design",
        text: "Used the club template to design birthday stories for 5+ Devs members.",
      },
    ],
  },
  {
    slug: "rec-media-shoot",
    title: "Startup Reel for REC Chennai",
    month: "23 November 2025",
    areas: ["Speaker"],
    contributions: [
      {
        label: "Speaker",
        text: "Speaker in a REC Media shoot for an informative reel about startups.",
      },
    ],
  },
];
