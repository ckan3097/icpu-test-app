**Pilot app for technical feasability of group chat with AI for 4000-level ICPU: Microsoft and The University of Sydney 'Ready or Not – Launching Graduates into the Workforce in the Age of Artificial Intelligence'**

This is an app to facilitate group chats with an AI agent present that can identify and respond to different group members with the context and background information of the whole group chat. This is mainly focused on the scenario of university group work, allowing group members to seamlessly interact with each other and include an AI agent in the team.

I created this app based on the tutorials:
- [Building a realtime chat app with Next.js and Vercel](https://ably.com/blog/realtime-chat-app-nextjs-vercel) (Ably, 2025)
- [Group chat app with OpenAI's GPT](https://ably.com/blog/group-chat) (Stephen Kiss, 2023) 

As a proof of technical feasability for my group's final year interdisciplinary [industry and community project](https://www.sydney.edu.au/students/industry-and-community-projects/4000-level-projects.html).

I might keep working on it to make it fancier at some point.

You will need to add a `.env` file with your API keys `ABLY_API_KEY=` and `OPENAI_API_KEY=` to use this app locally (you can pretend to be in a group by opening multiple windows), or deploy your own version so you can actually chat with other people.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
