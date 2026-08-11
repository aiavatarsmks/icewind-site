# Исходное задание (источник истины для ревью)

> Это дословный текст первоначального технического задания, выданного агенту, который вносил изменения. При расхождении любого пункта — приоритет у этого документа.

---

You are working on the existing production website:

https://www.icewinddaleconsulting.com/

Your task is to add five complete service-specialisation pages and connect them properly to the homepage.

Before making changes, inspect the existing project structure, components, styles, typography, spacing, animations, responsive behaviour, navigation, footer, metadata implementation and deployment configuration.

Do not redesign the website. Extend the current design system so that every new page feels like an original part of ICE WIND.

## Main objective

Create these five service pages:

1. Web Development
2. Game Development
3. Web App Development
4. AI Automation
5. Web Design

Use these routes:

* /web-development/
* /game-development/
* /web-app-development/
* /ai-automation/
* /web-design/

All five pages must be reachable from the homepage.

Each page must contain detailed information about its specialisation and finish with a clear call to action that directs the visitor to:

https://www.icewinddaleconsulting.com/start-a-project/

Do not place a contact form on the new pages. The existing Start a Project page remains the only main conversion page.

---

# 1. Homepage changes

Add a new section to the homepage.

This should be a normal content section integrated into the page flow, not a pop-up, floating advertisement or temporary promotional banner.

Use the English heading:

## Explore our specialisations

The section should visually match the current ICE WIND website.

Include five clickable cards or panels:

* Web Development
* Game Development
* Web App Development
* AI Automation
* Web Design

Each card must include:

* the specialisation name;
* a concise one-sentence explanation;
* a visual treatment consistent with the existing site;
* a clear link to the corresponding service page;
* accessible hover and keyboard-focus states.

Suggested short descriptions:

### Web Development

Fast, reliable websites and digital platforms built around real business goals.

### Game Development

Browser, mobile and interactive game experiences developed from concept to launch.

### Web App Development

Custom web applications, SaaS products, dashboards and internal business systems.

### AI Automation

Practical AI integrations and automated workflows that reduce repetitive work.

### Web Design

Clear, modern and conversion-focused interfaces designed for real users.

The entire card may be clickable, but it must also contain a semantically correct link.

Place the new section in a logical location on the homepage.

It should appear after the existing general capabilities or “What we do” section and before the later trust, consulting, process or contact sections, depending on the actual component structure.

Do not duplicate the same content unnecessarily.

The existing homepage currently presents broad capabilities including web, automation, AI and games. Preserve that content unless a small adjustment is required to introduce the new specialisation section naturally.

---

# 2. Shared requirements for all five pages

Each page must use the existing:

* header;
* navigation;
* typography;
* colours;
* buttons;
* spacing system;
* content width;
* footer;
* trust elements;
* responsive breakpoints;
* animation language.

Reuse existing components wherever possible.

Create reusable service-page components rather than copying five independent page implementations.

Possible shared components include:

* ServiceHero
* ServiceOverview
* ServiceCapabilities
* ServiceBenefits
* ServiceProcess
* ServiceTechnology
* ServiceFAQ
* ServiceCTA
* SpecialisationNavigation

Adapt the names to the existing project conventions.

Do not introduce a new framework, component library or CSS methodology unless the current project already uses it.

Do not damage any current homepage links, forms, SEO metadata or responsive behaviour.

---

# 3. Required structure of every service page

Every page must contain the following sections.

There should be no case-study section because public case studies are not ready yet.

## Section 1: Hero

Include:

* a clear H1;
* a concise value proposition;
* a short supporting paragraph;
* a primary CTA leading to /start-a-project/;
* an optional secondary anchor link such as “Explore the service”.

The hero must communicate the specialisation immediately.

Avoid generic slogans that do not explain the service.

## Section 2: What we build or provide

Explain the concrete products, systems or deliverables included in the specialisation.

Use a structured card or list layout.

## Section 3: Problems this service solves

Explain what business or product problems clients normally bring to ICE WIND.

Focus on practical situations rather than vague marketing language.

## Section 4: Why ICE WIND

Explain relevant advantages such as:

* one team across design and development;
* practical technical consulting;
* clear scope, timeline and cost before work begins;
* solutions matched to the actual task;
* support after launch;
* London-based UK registered company;
* the ability to deliver both initial versions and larger custom products.

Do not invent awards, certifications, customer counts, success percentages or delivery statistics.

## Section 5: Technologies and capabilities

Present relevant capabilities without creating a meaningless wall of logos.

Only mention technologies already used or genuinely supported by the existing company positioning and project.

When uncertain, keep the language capability-based rather than claiming a specific technology.

For example:

* responsive frontend development;
* backend systems and APIs;
* databases;
* cloud deployment;
* third-party integrations;
* AI model integration;
* analytics;
* mobile-friendly interfaces.

## Section 6: How we work

Use a clear process, aligned with the current ICE WIND site.

Suggested stages:

1. Discover
2. Define
3. Design
4. Build
5. Test and launch
6. Support and improve

The existing homepage currently uses Discover, Design, Build, Launch & Support. Preserve consistency with that language.

## Section 7: FAQ

Add useful, service-specific questions and concise answers.

Use accessible semantic markup.

Implement FAQ structured data only if it can be added correctly and consistently with the current project.

Do not use fake questions purely to insert keywords.

## Section 8: Final CTA

Every service page must end with a strong CTA section.

Suggested heading:

## Let’s build the right version of your project

Suggested supporting copy:

Tell us what you want to create, what stage you are at and what outcome you need. A formal technical brief is not required.

Primary button:

## Start a project

The button must lead to:

/start-a-project/

Optionally include the direct email address already used by the website:

[manager@icewinddaleconsulting.com](mailto:manager@icewinddaleconsulting.com)

Do not embed or duplicate the project enquiry form on these pages.

---

# 4. Page-specific content

## A. Web Development

Route:

/web-development/

Suggested H1:

## Web Development in London

Suggested positioning:

ICE WIND designs and develops fast, reliable websites and digital platforms for businesses, products and new ventures.

Cover:

* corporate websites;
* landing pages;
* marketing websites;
* e-commerce websites and product catalogues;
* portals and booking platforms;
* website rebuilds;
* legacy website modernisation;
* CMS-based websites where appropriate;
* frontend and backend development;
* integrations with external services;
* performance, accessibility and responsive behaviour;
* deployment and ongoing support.

Problems to address:

* an outdated or slow website;
* a website that does not generate enquiries;
* limitations of a template or no-code platform;
* fragmented contractors;
* the need to launch a new business or product;
* unclear technical scope;
* the need to rebuild without losing essential content.

Suggested FAQ topics:

* How much does a website cost?
* How long does development take?
* Can you redesign an existing website?
* Can you work with our existing branding?
* Do you provide support after launch?
* Do we need a technical brief?

Do not promise a fixed price or fixed delivery time without project context.

---

## B. Game Development

Route:

/game-development/

Suggested H1:

## Game Development for Mobile, Web and Interactive Products

Suggested positioning:

ICE WIND develops games and interactive experiences for businesses, creators, platforms and branded products.

Cover:

* mobile games;
* browser and HTML5 games;
* casual 2D games;
* Telegram Mini App games;
* game prototypes and MVPs;
* gameplay systems;
* progression systems;
* leaderboards;
* player profiles;
* in-game economies;
* backend systems;
* gamification for websites and digital products;
* testing, launch and continued development.

Do not claim that any particular engine or platform is used unless it is confirmed by the repository or existing content.

Problems to address:

* turning a game concept into a working prototype;
* validating gameplay before full production;
* adding gamification to an existing product;
* creating a branded game;
* building a browser-accessible game;
* connecting gameplay with accounts, scores or rewards;
* continuing or improving an existing game project.

Suggested FAQ topics:

* What kinds of games do you develop?
* Can you build a playable prototype first?
* Do you develop games for mobile devices?
* Can you create browser games?
* Can you add leaderboards or player accounts?
* Can you continue development after launch?

Do not include a case study yet.

Do not present an unfinished client game as completed.

---

## C. Web App Development

Route:

/web-app-development/

Suggested H1:

## Custom Web App Development in London

Suggested positioning:

ICE WIND builds custom web applications that turn business processes, services and product ideas into practical digital systems.

Cover:

* SaaS MVPs;
* customer portals;
* internal business tools;
* admin panels;
* dashboards;
* booking systems;
* marketplaces;
* account-based platforms;
* workflow systems;
* data management systems;
* payment integration;
* CRM and third-party integrations;
* APIs;
* authentication and user roles;
* reporting and analytics;
* scalable product foundations.

Make the distinction between a normal marketing website and a web application clear.

Problems to address:

* business processes managed through spreadsheets;
* disconnected software;
* repetitive manual administration;
* the need to launch a SaaS product;
* lack of visibility into operations;
* customers needing self-service access;
* an existing application that is difficult to maintain;
* the need for a realistic MVP.

Suggested FAQ topics:

* What is the difference between a website and a web application?
* Can you build an MVP?
* Can you integrate with our existing software?
* Can you replace spreadsheet-based processes?
* How do you define the first version?
* Can the application grow after launch?

---

## D. AI Automation

Route:

/ai-automation/

Suggested H1:

## AI Automation and Integration for Business

Suggested positioning:

ICE WIND integrates AI into real products and workflows, helping businesses reduce repetitive work and make information easier to use.

Cover:

* AI assistants;
* internal knowledge assistants;
* customer-support automation;
* document processing;
* information extraction;
* workflow automation;
* CRM automation;
* lead qualification;
* AI integration into websites and web applications;
* retrieval and knowledge-base systems;
* reporting and data workflows;
* API-based AI integrations;
* human review and controlled automation.

Avoid presenting AI as magic.

Focus on practical, controlled use cases.

Problems to address:

* repetitive customer enquiries;
* teams searching through documents manually;
* repetitive data entry;
* disconnected workflows;
* slow document review;
* information spread across multiple systems;
* existing software that needs an AI layer;
* uncertainty about whether AI is appropriate for a particular process.

Suggested FAQ topics:

* What business processes can be automated with AI?
* Can AI connect to our existing systems?
* Will humans still be able to review the output?
* Can you build an internal knowledge assistant?
* Do we need a large amount of data?
* How do you protect confidential business information?

Do not make unsupported legal, security or compliance guarantees.

---

## E. Web Design

Route:

/web-design/

Suggested H1:

## Web Design in London

Suggested positioning:

ICE WIND designs clear, modern and responsive websites that communicate value quickly and guide users towards meaningful action.

Cover:

* website strategy;
* information architecture;
* user journeys;
* wireframes;
* responsive interface design;
* landing-page design;
* corporate website design;
* product and SaaS interface design;
* visual systems;
* conversion-focused page structure;
* design for accessibility and usability;
* design prepared for development;
* redesign of existing websites.

Make clear that ICE WIND can both design and develop the final website, reducing hand-offs between separate agencies.

Problems to address:

* a website that looks outdated;
* unclear messaging;
* confusing navigation;
* poor mobile experience;
* inconsistent visual identity;
* low enquiry conversion;
* a design that cannot be implemented realistically;
* a product interface that is difficult to use.

Suggested FAQ topics:

* Do you provide design without development?
* Can you redesign our existing website?
* Will the design work on mobile devices?
* Can you use our existing brand identity?
* Do you create wireframes and prototypes?
* Can ICE WIND also develop the finished website?

---

# 5. Navigation and internal linking

Make the new pages discoverable from the homepage through the new “Explore our specialisations” section.

Also inspect the existing navigation and footer.

Add a compact “Specialisations” or “Services” group to the footer only if it fits naturally without cluttering the existing design.

Possible footer links:

* Web Development
* Game Development
* Web App Development
* AI Automation
* Web Design

Do not overload the main header navigation with five additional items unless there is already an appropriate dropdown or services navigation pattern.

If the project currently has a suitable Services link, it may link to the homepage specialisations section.

Each service page should also include a small internal navigation section near the bottom, before the final CTA, such as:

## Explore other specialisations

Show links to the other four pages.

This section should be visually lighter than the main homepage specialisation block.

---

# 6. SEO requirements

Add unique metadata for every page:

* title;
* meta description;
* canonical URL;
* Open Graph title;
* Open Graph description;
* Open Graph URL;
* Twitter metadata if the project already supports it.

Suggested titles:

### Web Development

Web Development London | ICE WIND

### Game Development

Game Development Studio London | ICE WIND

### Web App Development

Web App Development London | ICE WIND

### AI Automation

AI Automation Agency London | ICE WIND

### Web Design

Web Design London | ICE WIND

Write natural meta descriptions. Do not keyword-stuff.

Each page must have:

* exactly one H1;
* logical H2 and H3 hierarchy;
* crawlable text;
* descriptive internal links;
* no placeholder content;
* no duplicated metadata;
* no accidental noindex;
* no broken canonical URLs.

Update the sitemap if the project generates it manually or requires route registration.

Ensure the pages are not blocked by robots directives.

Use service-related structured data only if it can be implemented accurately. Do not add ratings, review schema, customer counts or fabricated business data.

Preserve the existing company identity:

ICE WIND is a trading brand of ICEWIND DALE CONSULTING LTD.

Company number:

15925349

Location:

London, England

Do not change the existing legal information.

---

# 7. Responsive and accessibility requirements

The new homepage section and every new page must work correctly on:

* desktop;
* tablet;
* mobile.

Check:

* text wrapping;
* card height;
* section spacing;
* button width;
* navigation;
* footer;
* long headings;
* hover states;
* keyboard navigation;
* visible focus states;
* semantic landmarks;
* image alternative text;
* colour contrast.

Avoid horizontal scrolling.

Respect reduced-motion preferences if the current website includes animations.

Do not make important content dependent on animation or hover.

---

# 8. Content rules

All website copy must be written in professional British English.

Use the current ICE WIND tone:

* confident;
* direct;
* technically competent;
* clear;
* not overhyped;
* not full of corporate jargon.

Do not use invented claims such as:

* award-winning;
* industry-leading;
* hundreds of clients;
* guaranteed results;
* guaranteed delivery time;
* guaranteed conversion increase;
* number-one agency;
* decades of experience.

Do not invent:

* testimonials;
* clients;
* projects;
* case studies;
* statistics;
* partnerships;
* certifications;
* technology experience.

Do not add stock case-study placeholders.

There should simply be no case-study section at this stage.

---

# 9. Visual direction

Use the current ICE WIND visual language.

Do not create five pages that look like generic SEO landing-page templates.

The service pages should feel editorial, structured and premium, while retaining the simplicity of the current site.

Possible visual devices, only when consistent with the current project:

* restrained service labels;
* large typography;
* clean capability grids;
* numbered process steps;
* subtle lines and borders;
* compact trust indicators;
* understated transitions;
* generous spacing.

Do not add unrelated stock photos.

Prefer abstract interface elements, subtle graphical treatments or no imagery at all if that better matches the existing site.

Do not use emoji as service icons unless the current project already does so.

---

# 10. Technical implementation

Before editing:

1. Inspect the project.
2. Identify the framework and routing structure.
3. Identify reusable layout and section components.
4. Identify how metadata, sitemap and structured data are currently managed.
5. Identify the current styling conventions.
6. Identify whether the website uses static generation, server rendering or client rendering.

Then implement the feature using the existing architecture.

Keep the code maintainable.

Avoid five pages containing large duplicated JSX or HTML blocks.

Prefer shared content data and reusable components.

For example, the service-page content may be represented as structured data with:

* slug;
* title;
* eyebrow;
* introduction;
* capabilities;
* problems;
* benefits;
* technologies;
* process;
* FAQs;
* metadata.

However, do not force this architecture if it conflicts with the existing project.

Do not refactor unrelated parts of the website.

Do not replace working components merely to make the new implementation more uniform.

---

# 11. Verification checklist

After implementation, verify all of the following:

* the homepage loads correctly;
* the new “Explore our specialisations” section appears;
* all five cards lead to the correct pages;
* all five service routes load directly;
* browser refresh works on every route;
* all internal links work;
* all Start a Project buttons lead to /start-a-project/;
* no new page contains a contact form;
* no new page contains fake case studies;
* header and footer remain consistent;
* mobile layouts work;
* there is no horizontal overflow;
* metadata is unique;
* canonical URLs are correct;
* the sitemap includes the new pages where applicable;
* build and lint checks pass;
* existing forms still work;
* existing homepage anchors still work;
* Trust & Compliance links still work;
* Companies House links remain unchanged;
* no legal or trust content has been removed;
* no console errors appear.

Run the available build, lint and test commands.

Fix any errors caused by the implementation.

At the end, provide a concise report containing:

1. files created;
2. files modified;
3. routes added;
4. reusable components created;
5. SEO changes;
6. sitemap or structured-data changes;
7. commands run;
8. test results;
9. any assumptions made.

Do not deploy unless deployment is already an automatic consequence of committing changes or I explicitly instruct you to deploy.
