export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/styles");
    eleventyConfig.addPassthroughCopy("src/icons");
    eleventyConfig.addPassthroughCopy("src/theme.js");
    eleventyConfig.addPassthroughCopy("src/fact-box.js");
    eleventyConfig.addPassthroughCopy("src/portrait.jpg");
    eleventyConfig.addPassthroughCopy("src/resume.pdf");

    return {
        dir: {
            input: "src",
            output: "_site"
        }
    };
}
