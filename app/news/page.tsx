import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import NewsEventsStream from "@/components/NewsEventsStream";
import { getEvents, getNews } from "@/lib/data";

export const metadata: Metadata = {
  title: "News & Events",
  description:
    "A unified news and events stream from across the Crescent ecosystem — announcements, achievements and upcoming gatherings from every institution.",
  alternates: { canonical: "/news" },
};

export const revalidate = 600;

export default async function NewsPage() {
  const [news, events] = await Promise.all([getNews(), getEvents()]);

  return (
    <>
      <PageHeader
        eyebrow="Across the Network"
        title="News & Events"
        description="One place for updates and gatherings from every Crescent institution. For full event dates and coordination, see the Central Calendar."
      />
      <div className="container-page py-14">
        <NewsEventsStream news={news} events={events} />
      </div>
    </>
  );
}
