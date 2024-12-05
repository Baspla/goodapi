import express, {NextFunction, Request, Response} from 'express';
import {requireAuth} from "../../middleware/auth.js";
import assert from "node:assert";

export const router = express.Router();

router.get('/urlPreview', requireAuth, async function (req: Request, res: Response, next: NextFunction) {
    try {
        const { url } = req.query;
        if (!url) {
            next({ status: 400, message: 'URL is required' });
            return;
        }
        assert(typeof url === 'string');
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            next({ status: 400, message: 'Invalid URL' });
            return;
        }

        const response = await fetch(url);
        const html = await response.text();

        // extract meta tags (like og:title, og:description, og:image, twitter:title, etc.)
        const metaTagsRegex = /<meta\s+property=["']([^"']+)["']\s+content=["']([^"']+)["']\s*\/?>/gi;
        const metaTags: any = {};
        let match;

        while ((match = metaTagsRegex.exec(html)) !== null) {
            const [, property, content] = match;
            metaTags[property] = content;
        }

        // extract title
        const titleRegex = /<title>([^<]+)<\/title>/i;
        const titleMatch = titleRegex.exec(html);
        const title = titleMatch ? titleMatch[1] : undefined;

        // extract first image
        const imageRegex = /<img\s+src=["']([^"']+)["']/i;
        const imageMatch = imageRegex.exec(html);
        const imageUrl = imageMatch ? imageMatch[1] : undefined;

        const preview = {
            url: url,
            title: metaTags['og:title'] || metaTags['twitter:title'] || title,
            description: metaTags['og:description'] || metaTags['twitter:description'] || metaTags['description'] || '',
            imageUrl: metaTags['og:image'] || metaTags['twitter:image'] || imageUrl || ''
        };

        res.json({ preview });
    } catch (error) {
        next(error);
    }
});