import type { MetadataRoute } from "next";
import { getSiteBaseUrl } from "@/lib/site-url";
import { COURSE_SLUGS } from "@/lib/courses/catalog";
import { getAllSlugs, getMember } from "@/lib/team";

// Public, indexable routes only. Deliberately excludes: /admin/*, transient
// outcome pages (thank-you / booked / not-qualified) which are noindex, and
// the placeholder team members that render "Bio coming soon".
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteBaseUrl();
  const lastModified = new Date();

  const staticPaths: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/about-us", changeFrequency: "monthly", priority: 0.8 },
    { path: "/about-the-firm", changeFrequency: "monthly", priority: 0.8 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
    { path: "/careers", changeFrequency: "weekly", priority: 0.7 },
    { path: "/careers/apply", changeFrequency: "monthly", priority: 0.5 },
    { path: "/partner-with-us", changeFrequency: "monthly", priority: 0.9 },
    { path: "/support", changeFrequency: "monthly", priority: 0.5 },
    { path: "/book-a-call", changeFrequency: "monthly", priority: 0.7 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p.path}`,
    lastModified,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  for (const slug of COURSE_SLUGS) {
    entries.push({
      url: `${base}/courses/${slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // Only real, named team members. getAllSlugs also includes placeholder
  // slots (cfo/cso/…) whose pages read "Bio coming soon" — skip those so we
  // don't hand crawlers thin/placeholder content.
  for (const slug of getAllSlugs()) {
    if (!getMember(slug)?.bio?.length) continue;
    entries.push({
      url: `${base}/team/${slug}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    });
  }

  return entries;
}
