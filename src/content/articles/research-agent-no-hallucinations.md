---
title: "How I Built a Research Agent That Doesn't Hallucinate"
date: "2026-03-28"
description: "I turned Anthropic's hallucination reduction guide into a working research agent. Here's the architecture, the guardrails, and a real example."
linkedinUrl: ""
---

## The problem

Anthropic published a guide on reducing hallucinations. I turned it into a working research agent.

I'll walk through why I built it, what's under the hood, and show a real example of what it produces.

## Reading the docs

I went through the Anthropic documentation front to back. Prompt engineering, tool use, agentic patterns, evaluation, guardrails. I was looking for one thing: how to make model output trustworthy enough to use for real research.

Deep in the "Strengthen Guardrails" section, there's a page called [Reduce Hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations).

It doesn't get talked about much. But it's the one that changed how I build agents.

Not vague advice. Actual patterns you can implement. I read it and realized it was the blueprint for the research agent I'd been trying to build.

## The guardrails

I took every technique in that guide and wired them into the agent as hard rules.

**Say "I don't know."**

Give the model explicit permission to admit when it doesn't have enough information. This is straight from Anthropic's guide. Out of the box, models are optimized to give you an answer. That's fine for brainstorming. For research, you need the model to stop when it's unsure instead of filling the gap with something plausible.

**Quote first, then analyze.**

Before drawing any conclusions, the agent pulls exact quotes from source material. Anthropic recommends this for documents over 20k tokens, but I enforce it on everything. The analysis has to come from what the text actually says, not what the model assumes it says.

**Cite everything or cut it.**

Every claim gets an inline source. After generating output, the agent audits itself. If a claim has no backing, it gets removed. Anthropic's doc calls this "verify with citations" and suggests having the model retract unsupported claims. That's exactly what mine does.

**Show the reasoning.**

Step-by-step chain of thought, visible in the output. Anthropic calls this "chain-of-thought verification." Bad logic gets caught before it reaches me. If the reasoning doesn't hold up, I can see where it broke down.

## The search layer

Guardrails only work if the agent has good sources to work with. I didn't want it depending on a single search provider.

It runs against my self-hosted [SearXNG](https://github.com/searxng/searxng) instance. SearXNG is a metasearch engine that aggregates results from Bing, DuckDuckGo, Brave, Reddit, and Startpage. Results get deduplicated and ranked by how many engines surfaced each URL. If three engines found the same page, it's probably more reliable than something only one engine returned.

No single provider dependency. No API rate limits from any one service. And because it's self-hosted, I control the configuration.

## How it works in practice

The whole thing is a slash command in [Claude Code](https://claude.ai/code). Type `/research`, ask a question, and the agent:

1. Searches SearXNG for relevant sources
2. Reads the actual pages (not just snippets)
3. Extracts quotes and key data points
4. Builds a structured report with inline citations
5. Audits its own output for unsupported claims
6. Publishes the report to GitHub

Pair it with Claude Code's looping feature and it keeps checking for new developments on a schedule, appending updates with timestamped changelogs. For a breaking story, you can set it and walk away. It'll keep working.

## Real example: the LiteLLM supply chain attack

Last week, the LiteLLM Python package got hit with a supply chain attack. A threat actor called TeamPCP published malicious versions to PyPI that harvested SSH keys, cloud credentials, and crypto wallets from systems with roughly 95 million monthly downloads.

I pointed `/research` at it.

Over four days, the agent tracked the story and produced a structured report with these sections:

**Findings**: 9 sections covering the full attack chain, three-stage payload analysis, affected versions and timeline, how it was discovered, the response, TeamPCP's broader campaign, a comparison to the XZ Utils backdoor, and implications for supply chain security.

**Sources**: 122 individually cited references. Every URL was fetched and read by the agent, not just listed from search results.

**Confidence & Gaps**: An explicit breakdown. What's high confidence (confirmed by multiple independent sources), what's medium confidence (reasonable inference), and what gaps remain in the public record. This is the section most research tools skip entirely.

**Indicators of Compromise**: Full IoC listing: hashes, domains, IPs, file paths. Ready for detection and response.

The report grew from initial findings to 490 lines. Every claim sourced. Updated continuously as the story developed, from the initial PyPI compromise through TeamPCP's second attack on Telnyx three days later.

You can read the full report here: [LiteLLM PyPI Supply Chain Attack: Analysis and Comparison to XZ Utils Backdoor](https://github.com/pete-builds/research-reports/blob/main/litellm-pypi-supply-chain-attack.md)

## Why this matters

The model is capable. The documentation is there. The gap is in how people are building on top of it.

Most agent builds I see skip the guardrails entirely. They connect a model to some tools and call it done. That works until it doesn't, and with research, "doesn't work" means wrong information presented with confidence.

Anthropic already wrote the playbook. It's in their docs. I just implemented it.

## Links

- [Anthropic: Reduce Hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
- [LiteLLM supply chain attack report](https://github.com/pete-builds/research-reports/blob/main/litellm-pypi-supply-chain-attack.md)
- [SearXNG](https://github.com/searxng/searxng)
- [Claude Code](https://claude.ai/code)

---

*If you're building agents with Claude or any other model, I'm curious how you're handling the hallucination problem. What's working? What isn't? Drop a comment.*
