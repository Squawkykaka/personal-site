import { defineCollection } from "astro:content";
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const games = defineCollection({
    loader: glob({ pattern: "*/config.toml", base: "./src/games"}),
    schema: (thing) => z.object({
        title: z.string(),
        description: z.string(),
        type: z.enum(["q5js"])
    })
})

const posts = defineCollection({
    loader: glob({ pattern: "*.md", base: "./src/pages/posts"}),
    schema: (thing) => z.object({
        date: z.coerce.date(),
        title: z.string(),
        published: z.boolean(),
        read_mins: z.number(),
        tags: z.array(z.string().startsWith("#")),
        description: z.string(),
    })
})

export const collections = { games, posts };