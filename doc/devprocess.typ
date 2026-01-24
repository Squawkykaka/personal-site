#title("The dev process making my personal site")

= Intro
This document describes the process i took in order to develop my personal #link("https://squawkykaka.com")[site]
the start of this document outlines the steps i took to plan a minimum viable product, and choose the correct tooling for the site.

= Planning
To develop this site i need to decide on the minimums specs of the site.
My planned design is a fake desktop environment styled on the first apple computers, the minimum features would include 
a fake explorer app that shows the various games i have made. A secondary app to show high scores styled around a retro
game scores website would be used.

== MVP
#table(
  columns: (auto, 1fr),
  inset: 10pt,
  align: horizon,
  table.header(
    [], [*Description*]
  ),
  [Application API], [This would be an api to allow designing apps for the website, 
    and have them automatically work with the windowing system, and other parts of the app],
  [Folder App], [This app would allow showing different content like a file explorer,
    this would only be games folder for mvp],
  [Game importing system], [A way to easily import and add new games to the site.
    This would most likely be a content folder with some metadata that gets parsed into a game page],
  [Score App], [This app would show scored fetched from a firebase database for any game]
)

== Nice to have
#table(
  columns: (auto, 1fr),
  inset: 10pt,
  align: horizon,
  table.header(
    [], [*Description*]
  ),
  [Nice Artwork], [Artwork in a retro style, taking inspiration from the first apple computers. This would have a pink colorscheme],
  [Mobile compatibility], [],
  [Admin page], [],
)

#pagebreak()


== Library comparison
In order to speed up development and reduce code complexity, i am planning on using a javascript framework. In order to choose one
that meets my minimum requirements and is not overwhelming i will compare several.

=== requirements
#table(
  columns: (auto, auto, 1fr),
  inset: 10pt,
  align: center + horizon,
  table.header(
    [*Feature*], [*Required*], [*Description*]
  ),
  [Static site generation], [#sym.crossmark], [Static site generation reduces javascript sent to the website, and
    speeds up page performance. I do not think this is critical but the user experience would be better with it. This
    would also allow me to deploy using github pages and avoid settings up servers],
  [Custom elements], [#sym.checkmark], [The ability to create custom html elements while programming will 
    significantly reduce code duplication, as i can define certain prebuilt elements one and reuse them everywhere],
  [Firebase compatibility], [#sym.checkmark], [This is needed as the highscore system uses firbase librarys],
  [Easy to understand], [#sym.checkmark], [I do not want to have complex hard to understand systems, and i want it to
    be as close to normal javascript development as possible],
)

=== Frameworks
There are a huge number of avalable web frameworks, so i will only compare popular and well known ones.

#table(
  columns: (auto, auto, 1fr),
  inset: 10pt,
  align: center + horizon,
  table.header(
    [*Symbol*], [*Name*], [*Usefullness*]
  ),
  [#image("astro-icon-dark.svg", width: 20pt, height: auto)], [Astro], [Astro:=]
)
