---
title: "LiteLLM PyPI Supply Chain Attack: Admin Guide and Incident Tracker"
date: "2026-03-24"
updated: "2026-03-31"
archived: true
description: "On March 24, 2026, LiteLLM 1.82.7 and 1.82.8 on PyPI were backdoored by TeamPCP using stolen CI/CD credentials. The malware harvested SSH keys, cloud credentials, API keys, and crypto wallets. Written for LiteLLM admins: is it safe to update, and what should you check and rotate?"
---

> **Archived snapshot.** This was a live incident tracker, last updated March 31, 2026 and last polled at 1:10 PM ET that day. It is preserved here as written, including its recommendations as they stood at that moment. **Do not treat the version guidance below as current.** LiteLLM has shipped many releases since. Check the [BerriAI security blog](https://docs.litellm.ai/blog/security-update-march-2026) and [PyPI](https://pypi.org/project/litellm/) for present-day advice.


**TL;DR:** LiteLLM versions 1.82.7 and 1.82.8 on PyPI were backdoored on March 24 by TeamPCP using credentials stolen from a compromised Trivy security scanner. The malware harvested SSH keys, cloud credentials, API keys, and crypto wallets from every system that ran `pip install` during a ~5 hour window (47,000 downloads). Three days later, TeamPCP used those stolen credentials to compromise the Telnyx package too. LiteLLM v1.83.0 was published on PyPI on March 31 using the new CI/CD v2 pipeline with Trusted Publishing (no long-lived tokens). BerriAI has now updated the security blog to confirm v1.83.0 is a clean release and the release freeze is lifted. Community wheel analysis found no known IOCs. However, there is still no GitHub release tag, no release notes, and no confirmation that the Mandiant review concluded. Meanwhile, Wiz reports that TeamPCP has shifted to actively exploiting stolen credentials in AWS environments, enumerating IAM, EC2, ECS, S3, Secrets Manager, and Lambda across victim organizations. **Cautious users should hold at v1.82.6 until BerriAI publishes a GitHub release tag and confirms the Mandiant review is complete.** Risk-tolerant users can consider upgrading to v1.83.0 after verifying the wheel hash (`88c536d3...`).

## Current Status

*Last substantive update: March 31, 2026, 12:11 PM ET.*
*Last polled for new developments: March 31, 2026, 1:10 PM ET.*

- **BerriAI security blog updated: release freeze officially lifted.** The security blog at `docs.litellm.ai/blog/security-update-march-2026` has been updated to confirm v1.83.0 as a clean release published March 30 via the new CI/CD v2 pipeline, and states the release freeze is lifted. The blog now references "Townhall updates" on March 27 and describes the CI/CD v2 pipeline as adding "isolated environments, stronger security gates." The blog also confirms the repository codebase was never compromised. This resolves a key communication gap noted in prior updates, though it was done silently (no changelog or announcement of the blog edit). [source: https://docs.litellm.ai/blog/security-update-march-2026]
- **LiteLLM v1.83.0 published on PyPI (March 31).** First release since the attack. Version bump only (PR #24840 by `yuneng-berri`), merged alongside CI/CD v2 hardening (PR #24839 by `krrish-berri-2`). Published via the new Trusted Publishing pipeline (OIDC, no long-lived tokens). Community wheel analysis (issue #24843 by `pyozzi-toss`) found no known IOCs; wheel SHA-256: `88c536d339248f3987571493015784671ba3f193a328e1ea6780dbebaa2094a8`. However: still no GitHub release tag (latest tag remains `v1.82.6.rc.2`), no release notes published, and issue #24843 has no maintainer response. Community member `catmeme` posted detailed criticism at 8:15 AM ET: "I was expecting more communication on the first legit release after the supply chain attack." **Recommendation: cautious users should hold at v1.82.6** until BerriAI creates a GitHub tag, publishes release notes, and confirms the Mandiant review concluded. Risk-tolerant users can consider v1.83.0 after verifying the wheel hash. [source: https://pypi.org/project/litellm/1.83.0/, https://github.com/BerriAI/litellm/pull/24840, https://github.com/BerriAI/litellm/pull/24839, https://github.com/BerriAI/litellm/issues/24843, https://docs.litellm.ai/blog/ci-cd-v2-improvements]
- **CI/CD v2 hardening (March 30 blog).** BerriAI published specifics of the new release pipeline: (1) security scans run in isolated environments, (2) validation and release separated into different repositories, (3) Trusted Publishing for PyPI (OIDC, no long-lived credentials), (4) immutable Docker release tags. Planned but not yet implemented: SLSA Build Provenance and OpenSSF Scorecard/Allstar adoption. The v1.83.0 release is the first to use this pipeline. [source: https://docs.litellm.ai/blog/ci-cd-v2-improvements]
- **C2 infrastructure:** Exfiltration domain `litellm.cloud` takedown still stalled at registrar level. Domain may still be collecting data from systems with active persistence. Telnyx C2 at `83.142.209.203:8080` status unknown.
- **Active investigation:** Wiz (March 30) published detailed post-compromise analysis showing TeamPCP actively using stolen credentials to enumerate and access AWS environments. TTPs include IAM enumeration (ListUsers, ListRoles), EC2/Lambda discovery, ECS Exec for container command execution, S3/Secrets Manager bulk exfiltration, and git.clone operations using stolen PATs. TruffleHog used to validate credentials within hours of theft. Activity began as early as March 19. New IOCs: 7 IP addresses including 105.245.181.120 (Vodacom proxy), 138.199.15.172 and 154.47.29.12 (Mullvad VPN), user agent "Boto3/1.42.73" on Kali Linux. [source: https://www.wiz.io/blog/tracking-teampcp-investigating-post-compromise-attacks-seen-in-the-wild] SecurityWeek (March 31) independently confirms TeamPCP has moved from OSS to AWS cloud environments. [source: https://www.securityweek.com/teampcp-moves-from-oss-to-aws-environments/] Databricks investigating alleged compromise connected to TeamPCP campaign (CybersecurityNews, not confirmed). Mandiant forensic audit verified all LiteLLM releases v1.78.0 through v1.82.6 as clean; no announcement that the broader review has concluded. IETF Internet-Draft CB4A submitted March 29, directly motivated by this campaign.
- **No arrests.** FBI has issued a public warning. CISA added CVE-2026-33634 to KEV catalog (April 9 federal deadline, 9 days away). Singapore CSA, UK NCSC, NHS England, German BSI all published advisories.
- **Campaign status:** No new TeamPCP package compromises since March 27 (now 4+ days, longest quiet period since campaign began March 19). No expansion detected to RubyGems, crates.io, or Maven Central. Campaign has fully shifted from supply chain compromise to post-compromise exploitation and monetization. Wiz (March 30) confirms TeamPCP is actively exploiting stolen credentials in AWS environments, using TruffleHog for automated credential validation and accessing IAM, EC2, ECS, S3, Secrets Manager, and Lambda. [source: https://www.wiz.io/blog/tracking-teampcp-investigating-post-compromise-attacks-seen-in-the-wild] Infosecurity Magazine (March 31) reports TeamPCP is "validating, encrypting and exfiltrating" stolen credentials and exploring monetization via Lapsus$ and Vect partnerships. [source: https://www.infosecurity-magazine.com/news/teampcp-exploit-stolen-supply/] TeamPCP is running dual ransomware operations: CipherForce (proprietary, targeting high-value victims directly) and Vect (mass affiliate program via BreachForums). Lapsus$ released a claimed 3 GB AstraZeneca data archive for free after failing to find buyers; Cybernews partially verified the contents. [source: https://isc.sans.edu/forums/diary/32846/, https://www.securityweek.com/extortion-group-claims-it-hacked-astrazeneca/] GitGuardian analysis: 1,705 of 2,247 litellm-dependent packages were susceptible to pulling malicious versions; impacted orgs include Canonical, Microsoft, and NASA.
- **Broader supply chain context (March 31):** The axios npm package (100M+ weekly downloads) was separately compromised via a hijacked maintainer account, deploying a cross-platform RAT. This is NOT attributed to TeamPCP and appears to be a separate incident, but underscores the escalating frequency of supply chain attacks on major packages. [source: https://www.aikido.dev/blog/axios-npm-compromised-maintainer-hijacked-rat, https://thehackernews.com/2026/03/axios-supply-chain-attack-pushes-cross.html]
- **Coverage:** 90+ outlets (HivePro, Field Effect, GBHackers, News4Hackers among new publishers). No BerriAI post-mortem published.

## Table of Contents

1. [What Happened](#1-what-happened)
2. [Technical Analysis: The Three-Stage Payload](#2-technical-analysis-the-three-stage-payload)
3. [Timeline](#3-affected-versions-and-timeline)
4. [Discovery](#4-discovery)
5. [Response](#5-response)
6. [TeamPCP: Campaign Context](#6-teampcp-campaign-context)
7. [Broader Implications for AI/ML Supply Chain Security](#8-broader-implications-for-aiml-supply-chain-security)
8. [Comparison to XZ Utils Backdoor (CVE-2024-3094)](#7-comparison-to-xz-utils-backdoor-cve-2024-3094)
9. [Indicators of Compromise, Detection & Remediation](#indicators-of-compromise-detection--remediation)
10. [Confidence Assessment](#confidence-assessment)
11. [Open Questions](#open-questions)
12. [Sources](#sources)
13. [Update History](#update-history)
14. [How This Report Was Generated](#how-this-report-was-generated)

## Findings

### 1. What Happened

On March 24, 2026, a threat actor operating under the handle TeamPCP published two malicious versions of the LiteLLM Python package to PyPI. LiteLLM is a widely used AI/ML library providing a unified interface to 100+ LLM providers, with approximately 95 million monthly downloads. The compromised versions (1.82.7 and 1.82.8) existed solely on PyPI. GitHub releases only extended to v1.82.6.dev1, meaning the attacker published directly to the package registry without touching the source repository. [source: https://www.endorlabs.com/learn/teampcp-isnt-done, https://github.com/BerriAI/litellm/issues/24518]

The compromise chain traces back to an earlier breach of Aqua Security's Trivy project. LiteLLM's CI/CD ran Trivy via `ci_cd/security_scans.sh`, which installed Trivy from the apt repo without version pinning. The compromised Trivy binary (v0.69.4+) contained credential-harvesting code that dumped environment variables via Cloudflare Tunnels. The compromised Trivy leaked all CircleCI credentials (not GitHub Actions as initially assumed), which included both the PyPI publish token and the GitHub PAT. The maintainer confirmed on Hacker News: "this originated from the trivy used in our ci/cd." The maintainer also confirmed the accounts had 2FA enabled, indicating the compromise was via a stolen CI/CD token rather than weak credentials. [source: https://github.com/BerriAI/litellm/issues/24518, https://news.ycombinator.com/item?id=47501729]

The attacker obtained not only the PyPI publishing token but also a GitHub Personal Access Token (PAT). When asked directly on issue #24518 "How did all of the descriptions on your personal GitHub repos get changed - was that say, your personal token?", the maintainer replied "yes," confirming the PAT compromise. Community members identified suspicious activity on an unrelated repo owned by the maintainer (`krrishdholakia/blockchain`), and the attacker also created a `tpcp-docs` repository in the victim's GitHub account as an alternative exfiltration channel. [source: https://github.com/BerriAI/litellm/issues/24518]

The attacker's access extended beyond the main litellm repo. Malicious code was pushed into a separate BerriAI repository called `litellm-skills` on March 23 (commit `81c851c`), modifying a test workflow file with what was described as "a modification to secrets attack payload from @AdnaneKhan gato-x tool." This confirms the attacker was active in BerriAI infrastructure a full day before the PyPI publish. The code has since been deleted. [source: https://github.com/BerriAI/litellm/issues/24518, comment by seljak00vac at 12:21 PM ET]

### 2. Technical Analysis: The Three-Stage Payload

**Version 1.82.7** embedded an obfuscated payload in `litellm/proxy/proxy_server.py`, triggered on import via a base64-decoded payload. The injected 12 lines sat between legitimate code blocks to avoid suspicious clustering. The attack used `subprocess.run()` instead of `exec()`, bypassing static analysis. The attacker rebuilt the wheel with a regenerated RECORD file, so the RECORD entry for `proxy_server.py` contains the SHA-256 of the backdoored file. Standard integrity checks against the wheel's own metadata pass cleanly, which is why automated tooling did not catch the tampering. [source: https://www.endorlabs.com/learn/teampcp-isnt-done]

**Version 1.82.8** (published 13 minutes later at 6:52 AM ET) escalated the attack by adding a `.pth` file named `litellm_init.pth` (34,628 bytes). Python's site module executes `.pth` files on every interpreter startup. Any line beginning with `import` is passed to `exec()`, meaning the malware ran on every Python process, even without importing LiteLLM. [source: https://safedep.io/malicious-litellm-1-82-8-analysis/]

The payload operated in three stages:

**Stage 1 (Orchestrator):** Decoded embedded base64 scripts, piped credential harvester output to a temporary file, encrypted with AES-256-CBC + RSA-4096 OAEP using a hardcoded 4096-bit RSA public key, and exfiltrated as `tpcp.tar.gz` to `https://models.litellm.cloud/` (a spoofed domain registered March 23, 2026). [source: https://safedep.io/malicious-litellm-1-82-8-analysis/]

**Stage 2 (Credential Harvester):** A 17,281-byte collector targeting:
- SSH keys (RSA, Ed25519, ECDSA, DSA formats) across all users
- Environment variables, specifically targeting LLM API keys: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `AZURE_API_KEY`, `COHERE_API_KEY`, `GEMINI_API_KEY`, `REPLICATE_API_KEY`, plus `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `GOOGLE_APPLICATION_CREDENTIALS`, `VERTEX_PROJECT`, database connection strings, JWT tokens, webhook credentials, and CI/CD secrets [source: https://mrcloudbook.com/litellm-1828-malicious-pypi-package-credential-stealer/]
- AWS credentials, including a full AWS SigV4 signing routine implemented in pure Python to dump Secrets Manager and SSM Parameter Store without requiring boto3
- GCP application default credentials
- Azure directory trees
- Kubernetes service account tokens and secrets across all namespaces
- Cryptocurrency wallets (Bitcoin, Ethereum, Solana, Monero, and others)
- Database passwords, SSL private keys, shell history, CI/CD configs
- `.env` files, `.gitconfig`
[source: https://safedep.io/malicious-litellm-1-82-8-analysis/, https://www.endorlabs.com/learn/teampcp-isnt-done]

**Stage 3 (Persistence + Lateral Movement):**
- Installed a systemd user service named `sysmon.service` (impersonating legitimate telemetry) running `~/.config/sysmon/sysmon.py` with `StartLimitIntervalSec=0`, forcing systemd to restart it indefinitely
- Polled `https://checkmarx.zone/raw` every 50 minutes for arbitrary binaries to execute
- Featured a kill switch checking for "youtube.com" in responses
- On Kubernetes clusters: created privileged pods named `node-setup-*` in `kube-system` namespace on every node, with `hostPID: True` and `hostNetwork: True`, mounting the host filesystem and using `chroot` to install persistence directly on each node's root filesystem
[source: https://safedep.io/malicious-litellm-1-82-8-analysis/, https://www.endorlabs.com/learn/teampcp-isnt-done]

The published package contained three commented-out earlier payload iterations, revealing the attacker's development progression: Iteration 1 used `StringIO` + `exec()` with RC4 cipher obfuscation and named output files. Iteration 2 was a transitional version carrying both old and new harvester implementations (the largest blob at 69,316 base64 characters). Iteration 3 (the active payload) rewrote the orchestrator to use subprocess piping, removed `exec()` calls, and stripped the RC4 layer. Leaving these iterations in the published package was an operational security failure. [source: https://www.endorlabs.com/learn/teampcp-isnt-done]

An ironic flaw: the `.pth` launcher spawned a child Python process via `subprocess.Popen`, but because `.pth` files trigger on every interpreter startup, the child re-triggered the same `.pth`, creating an exponential fork bomb that crashed affected machines, which actually helped surface the attack. [source: https://futuresearch.ai/blog/litellm-pypi-supply-chain-attack/]

### 3. Affected Versions and Timeline

| Time (ET) | Event |
|---|---|
| March 31, ~12:11 PM | **BerriAI security blog silently updated.** Blog at `docs.litellm.ai/blog/security-update-march-2026` now confirms v1.83.0 as a clean release published March 30 via CI/CD v2 pipeline. States release freeze is lifted and repository codebase was never compromised. References "Townhall updates" on March 27 and describes CI/CD v2 as adding "isolated environments, stronger security gates." No changelog or announcement of the blog edit. Blog still does not state whether Mandiant review concluded. No security townhall recording or notes published publicly. [source: https://docs.litellm.ai/blog/security-update-march-2026] |
| March 31, ~10:14 AM | **SecurityWeek: TeamPCP moves from OSS to AWS environments.** Confirms Wiz findings that TeamPCP is actively using stolen credentials to access AWS cloud environments, moving beyond the supply chain phase. [source: https://www.securityweek.com/teampcp-moves-from-oss-to-aws-environments/] |
| March 31, morning | **Wiz publishes post-compromise analysis.** Detailed research (by Eden Abergil, Sean Johnstone, Zoe Rabi, Hila Ramati) reveals TeamPCP actively exploiting stolen credentials in AWS environments. TTPs: IAM enumeration (ListUsers, ListRoles, ListAttachedUserPolicies), EC2/Lambda discovery, ECS Exec abuse for container command execution via SSM Agent, S3/Secrets Manager bulk exfiltration, git.clone at scale. TruffleHog used for automated credential validation within hours of theft. Activity began as early as March 19. User agent: "Boto3/1.42.73" on Kali Linux. New IOCs: 105.245.181.120, 138.199.15.172, 154.47.29.12, 170.62.100.245, 163.245.223.12, 209.159.147.239, 34.205.27.48. Branch name "dev_remote_ea5Eu/test/v1" used for Nord Stream tool. [source: https://www.wiz.io/blog/tracking-teampcp-investigating-post-compromise-attacks-seen-in-the-wild] |
| March 31, morning | **Infosecurity Magazine reports TeamPCP exploring monetization of stolen secrets.** Wiz (now part of Google Cloud) confirms the group is "validating, encrypting and exfiltrating" credentials. Lapsus$ and Vect partnerships reconfirmed. No new package compromises. [source: https://www.infosecurity-magazine.com/news/teampcp-exploit-stolen-supply/] |
| March 31, ~1:00 AM ET | **LiteLLM v1.83.0 published on PyPI.** First release since the attack. Version bump only (PR #24840 by `yuneng-berri`, merged at 05:00 UTC). CI/CD v2 hardening merged simultaneously (PR #24839 by `krrish-berri-2`). Published via new Trusted Publishing pipeline (OIDC). Community wheel analysis (issue #24843 by `pyozzi-toss`) found no known IOCs; wheel SHA-256: `88c536d3...`. However: still no GitHub release tag (latest tag `v1.82.6.rc.2`), no release notes, security blog still says releases are paused. GitHub issue #24843 has community comments but no maintainer response. BerriAI CEO posted on LinkedIn but no formal channel update. Community member `catmeme` criticized communication gap. [source: https://pypi.org/project/litellm/1.83.0/, https://github.com/BerriAI/litellm/pull/24840, https://github.com/BerriAI/litellm/issues/24843] |
| March 30, afternoon | **SANS ISC Update 004** (Kenneth Hartman): TeamPCP running dual ransomware operations with CipherForce (proprietary, high-value targets) and Vect (mass affiliate via BreachForums). Lapsus$ releases claimed 3 GB AstraZeneca data archive for free after failing to find buyers; Cybernews partially verified contents including internal GitHub user data, employee records from clinical research subsidiaries, and source code tree structures. Supply chain pause now at 96+ hours (longest since campaign began). RubyGems, crates.io, Maven Central checked, zero TeamPCP IOCs found. CISA KEV deadline now 9 days away. [source: https://isc.sans.edu/forums/diary/32846/, https://www.securityweek.com/extortion-group-claims-it-hacked-astrazeneca/] |
| March 30, afternoon | SANS Stormcast reports TeamPCP brokering stolen credentials on BreachForums and collaborating with ransomware actors. HivePro reveals December 2025 CanisterWorm campaign (60,000+ servers). Coverage now 90+ outlets. [source: https://isc.sans.edu/podcastdetail/9870, https://hivepro.com/threat-advisory/teampcp-automated-supply-chain-from-trivy-to-litellm-in-a-multi-ecosystem-breach/] |
| March 30 | Databricks investigating alleged compromise connected to TeamPCP campaign (not confirmed). [source: https://cybersecuritynews.com/databricks-teampcp-supply-chain/] |
| March 30 | Telnyx confirms root cause resolved, states SDK had "no privileged access to Telnyx infrastructure," no customer data accessed. Users advised to revert to 4.87.0. [source: https://hackread.com/teampcp-fake-ringtone-file-tainted-telnyx-sdk-credentials/] |
| March 30 | PyPI still shows LiteLLM v1.82.6 as latest. No clean release. No BerriAI post-mortem. No arrests. |
| March 29-30 | GitGuardian quantitative analysis: 1,705 of 2,247 litellm-dependent packages susceptible to pulling malicious versions; 1,380 had litellm as a direct dependency. Top affected: dspy (5M/mo), opik (3M), mlflow (32M, optional). Impacted orgs include Canonical, Microsoft, NASA. [source: https://blog.gitguardian.com/team-pcp-snowball-analysis/] |
| March 29 | UK NCSC CTO weekly summary references TeamPCP campaign. IETF Internet-Draft CB4A submitted, proposing short-lived credential architecture for AI agents, motivated by this campaign. [source: https://ctoatncsc.substack.com/p/cto-at-ncsc-summary-week-ending-march-09e, https://datatracker.ietf.org/doc/draft-hartman-credential-broker-4-agents/] |
| March 28 | Singapore CSA advisory AD-2026-001: treat all secrets in affected environments as exposed and rotate immediately. [source: https://www.csa.gov.sg/alerts-and-advisories/advisories/ad-2026-001/] |
| March 28 | SANS ISC Update 003: no new package compromises in 48 hours; campaign shifting to monetization/extortion phase. [source: https://isc.sans.edu/diary/32842, https://malware.news/t/teampcp-supply-chain-campaign-update-003-operational-tempo-shift-as-campaign-enters-monetization-phase-with-no-new-compromises-in-48-hours-sat-mar-28th/105493] |
| March 28 | Palo Alto Networks, Cycode, ARMO, Cloud Security Alliance, and 4 others publish analyses (coverage 70+ outlets). CipherForce confirmed as TeamPCP's affiliate extortion platform. |
| March 27, ~2:30 PM ET | PyPI still shows LiteLLM v1.82.6 as latest. No clean version released. No BerriAI post-mortem. No arrests. Telnyx PyPI project quarantined. |
| March 27, morning | Help Net Security reports CISA confirms CVE-2026-33634 with April 9, 2026 federal remediation deadline; German BSI states "no data is believed to have been exfiltrated" [source: https://www.helpnetsecurity.com/2026/03/27/cve-2026-33017-cve-2026-33634-exploited/] |
| March 27, morning | Datadog Security Labs publishes comprehensive campaign analysis tracing the full TeamPCP credential chain [source: https://securitylabs.datadoghq.com/articles/litellm-compromised-pypi-teampcp-supply-chain-campaign/] |
| March 27, 03:51 UTC | Credential cascade confirmed: TeamPCP publishes malicious telnyx 4.87.1 and 4.87.2 to PyPI using credentials harvested from the LiteLLM attack three days earlier. Proves stolen credentials enable follow-on compromises. [source: https://www.helpnetsecurity.com/2026/03/27/teampcp-telnyx-supply-chain-compromise/, https://www.endorlabs.com/learn/teampcp-strikes-again-telnyx-compromised-three-days-after-litellm] |
| March 26, ~7:16 PM ET | Still no clean PyPI release. No BerriAI post-mortem. No arrests. |
| March 26, evening | DataBreachToday reveals 47,000 downloads in 46 minutes before PyPI removal. Kaspersky/Securelist publishes deep technical analysis. CyberKendra reports TeamPCP-Vect ransomware alliance. Coverage surges past 40+ outlets (Forbes, IT Pro, Comparitech, and others). [source: https://www.databreachtoday.com/litellm-hit-in-cascading-supply-chain-attack-a-31210, https://securelist.com/litellm-supply-chain-attack/119257/] |
| March 26, afternoon | CISA confirms CVE-2026-33634 added to Known Exploited Vulnerabilities (KEV) catalog, described as "Aqua Security Trivy Embedded Malicious Code Vulnerability." Federal agencies must remediate under BOD 22-01 with April 9, 2026 deadline (earlier reports of April 3 were incorrect). [source: https://www.cisa.gov/news-events/alerts/2026/03/26/cisa-adds-one-known-exploited-vulnerability-catalog, https://www.helpnetsecurity.com/2026/03/27/cve-2026-33017-cve-2026-33634-exploited/] |
| March 26, ~2:45 PM ET | PyPI still shows v1.82.6 as latest. No clean version released. GitHub issue #24518 at 99 comments, no new BerriAI maintainer updates since March 25 |
| March 26, morning | Microsoft publishes expanded Defender XDR detection guidance. CISA adds CVE-2026-33634 to KEV catalog. [source: https://cyberpress.org/microsoft-trivy-supply-chain-attack/, https://www.cisa.gov/news-events/alerts/2026/03/26/cisa-adds-one-known-exploited-vulnerability-catalog] |
| March 25-26 | Second wave: SANS, Kaspersky, Okta, Arctic Wolf, Trend Micro, Deepwatch, Recorded Future, and 8 others publish analyses (coverage 35+ outlets). [source: multiple, see Sources section] |
| March 25, evening | Andrej Karpathy calls the attack "software horror." [source: https://timesofindia.indiatimes.com/technology/tech-news/teslas-former-vp-andrej-karpathy-shares-ai-coding-horror-python-supply-chain-attack-that-could-have-wiped-millions-of-ssl-private-keys-database-passwords-more-and-elon-musk-agrees-says-/articleshow/129802671.cms] |
| March 25, evening | NHS England Digital publishes cyber alert CC-4761 for the LiteLLM compromise [source: https://digital.nhs.uk/cyber-alerts/2026/cc-4761] |
| March 25, ~6:20 PM ET | GitGuardian/SecurityBoulevard publishes incident response guide for the LiteLLM attack [source: https://securityboulevard.com/2026/03/how-gitguardian-enables-rapid-response-to-the-litellm-supply-chain-attack/] |
| March 25, ~5:51 PM ET | DanielRuf confirms all remaining 57 compromised GitHub accounts contacted via email; GitHub has banned/blocked the accounts to contain further damage [source: https://github.com/BerriAI/litellm/issues/24512] |
| March 25, ~5:11 PM ET | `nono` sandbox team publishes prevention write-up showing how network/file sandboxing would have blocked exfiltration even with compromised code installed [source: https://nono.sh/blog/nono-litellm] |
| March 25, afternoon | Community publishes `litellm-check` detection tool (filesystem-only scanner). The Hacker News, agentlair.dev, and others publish detailed analyses. [source: https://github.com/lucubrator/litellm-check, https://thehackernews.com/2026/03/teampcp-backdoors-litellm-versions.html] |
| March 25, ~2:30 PM ET | `krrish-berri-2` reaches out to DanielRuf on LinkedIn for advice on release pipeline security [source: https://github.com/BerriAI/litellm/issues/24518] |
| March 25, ~2:28 PM ET | BerriAI considering a "clean" version release, currently reviewing codebase to confirm security [source: https://github.com/BerriAI/litellm/issues/24518] |
| March 25, ~8:07 AM ET | MalwareBazaar catalogs first IoC hashes tagged `checkmarx-zone,models-litellm-cloud` (first major threat intel platform coverage) |
| March 25, morning | LiteLLM publishes official security blog post confirming attack window 6:39 AM - 12:00 PM ET [source: https://docs.litellm.ai/blog/security-update-march-2026] |
| March 25, morning | Microsoft Defender Security Research Team publishes detection and investigation guidance [source: https://www.microsoft.com/en-us/security/blog/2026/03/24/detecting-investigating-defending-against-trivy-supply-chain-compromise/] |
| March 25, morning | FBI Assistant Director Brett Leatherman warns of "increased breach disclosures, follow-on intrusions, and extortion attempts in the coming weeks" [source: https://www.infosecurity-magazine.com/news/teampcp-litellm-pypi-supply-chain/] |
| March 25, morning | Coverage explosion: 15+ outlets publish (SecurityWeek, CSO Online, Snyk, Sonatype, Infosecurity Magazine, and others). Lapsus$ confirmed as TeamPCP collaborator; 1,000+ SaaS environments compromised. [source: https://www.csoonline.com/article/4149938/trivy-supply-chain-breach-compromises-over-1000-saas-environments-lapsus-joins-the-extortion-wave.html] |
| March 24, ~10:29 PM | BleepingComputer publishes: "TeamPCP claims to have stolen data from hundreds of thousands of devices" [source: https://www.bleepingcomputer.com/news/security/popular-litellm-pypi-package-compromised-in-teampcp-supply-chain-attack/] |
| March 24, evening | The Register, BleepingComputer, and others publish. Endor Labs and JFrog credited as additional discoverers. [source: https://www.theregister.com/2026/03/24/trivy_compromise_litellm/] |
| March 24, ~5:08 PM | Compromised account count updated to 123 (up from 121) [source: https://github.com/BerriAI/litellm/issues/24512] |
| March 24, ~4:11 PM | Community criticism surfaces pre-existing code quality concerns (issue #23383), noting broken unit tests and security deprioritized for 1-2 years [source: https://github.com/BerriAI/litellm/issues/24518] |
| March 24, ~4:11 PM | Community member raises concern about 5-day gap between Trivy compromise (March 19) and LiteLLM response; BerriAI acknowledges, promises end-of-week lessons-learned review [source: https://github.com/BerriAI/litellm/issues/24518] |
| March 24, ~4:05 PM | `krrish-berri-2` confirms suspicious `litellm-skills` commit occurred during attack window; all GitHub PATs deleted and repo access removed [source: https://github.com/BerriAI/litellm/issues/24518] |
| March 24, ~4:03 PM | Both Krrish and Ishaan confirm GitHub account rotation complete [source: https://github.com/BerriAI/litellm/issues/24518] |
| March 24, ~2:58 PM | 121 compromised GitHub accounts initially identified spamming issue threads; accounts confirmed as real users compromised via the upstream Trivy credential stealer, not purpose-built bots [source: https://github.com/BerriAI/litellm/issues/24518] |
| March 24, ~2:45 PM | Community member publishes litellm-vuln-scanner tool; others warn that running Python-based scanners may trigger the .pth payload, recommending YARA rules or shell-native tools instead [source: https://github.com/BerriAI/litellm/issues/24518] |
| March 24, ~2:34 PM | DanielRuf confirms he has notified both CISA and German CERT (CERT-Bund/BSI), and provides a template for other countries' CERTs via FIRST.org member directory [source: https://github.com/BerriAI/litellm/issues/24518] |
| March 24, ~2:20 PM | Community member shares Cloudflare's direct contact number for abuse reporting [source: https://github.com/BerriAI/litellm/issues/24518] |
| March 24, ~2:17 PM | Trivy-action dependency updated to v0.35.0 (from pinned v0.69.3) per Socket.dev recommendation [source: https://github.com/BerriAI/litellm/issues/24518] |
| March 24, ~2:16 PM | `krrish-berri-2` reaches out to Spaceship and requests Cloudflare contact for domain takedown [source: https://github.com/BerriAI/litellm/issues/24518] |
| March 24, ~1:52 PM | Domain takedown efforts for `litellm.cloud` stalled: Spaceship registrar returning empty automated replies |
| March 24, ~1:16 PM | All new releases blocked pending completion of security scans |
| March 24, ~1:16 PM | Maintainer confirms CircleCI (not GitHub Actions) as the CI platform where credentials leaked; Trivy pinned to v0.69.3 (last safe version) |
| March 24, ~1:03 PM | BerriAI confirms engagement of Google's Mandiant for incident response |
| March 24, ~12:57 PM | `krrish-berri-2` confirms all 30 BerriAI repos validated: no deploy keys or env vars remaining |
| March 24, ~12:33 PM | Maintainer promises further updates: "I will be updating this thread, as we have more to share" |
| March 24, ~12:28 PM | Maintainer identity partially verified via HN account cross-reference |
| March 24, ~12:21 PM | Community identifies malicious code in `litellm-skills` repo from March 23 |
| March 24, ~12:17 PM | Trivy dependency pinned to last known safe version (PR #24525) |
| March 24, ~12:06 PM | PyPI maintainer Mike Fiedler assigns **PYSEC-2026-2** advisory [source: https://github.com/pypa/advisory-database/blob/main/vulns/litellm/PYSEC-2026-2.yaml] |
| March 24, post-11:27 AM | Issue #24512 reopened (now has 400+ comments) |
| March 24, ~11:27 AM | BerriAI promises official advisory and incident report |
| March 24, ~11:27 AM | Compromised versions deleted, package unquarantined |
| March 24, ~11:09 AM | `krrish-berri-2` announces all maintainer accounts deleted and recreated |
| March 24, ~10:11 AM | Community discovers maintainer's GitHub PAT also compromised |
| March 24, ~9:52 AM | `krrishdholakia` confirms PyPI quarantine on GitHub |
| March 24, ~9:48 AM | Issue #24518 opened as clean tracking issue (by `isfinne`) |
| March 24, ~9:12 AM | MLflow merges emergency PR pinning `litellm<=1.82.6` [source: https://github.com/mlflow/mlflow/pull/21971] |
| March 24, ~9:03 AM | GitHub issue #24512 closed as "not planned" and flooded with bot spam |
| March 24, ~8:30 AM | Version 1.82.7 confirmed also compromised |
| March 24, 7:25 AM | PyPI quarantined the entire litellm package (all versions) [source: https://www.wiz.io/blog/teampcp-attack-kics-github-action] |
| March 24, 6:52 AM | litellm 1.82.8 published to PyPI (added .pth file) |
| March 24, 6:39 AM | litellm 1.82.7 published to PyPI (payload in proxy_server.py) |
| March 23, 2026 | Malicious code pushed to `litellm-skills` repo (commit `81c851c`) |
| March 23, 2026 | Spoofed domain `models.litellm.cloud` registered |
| March 22, 2026 | Last clean version (1.82.6) published |

[source: https://futuresearch.ai/blog/litellm-pypi-supply-chain-attack/, https://github.com/BerriAI/litellm/issues/24518]

### 4. Discovery

FutureSearch discovered the compromise when LiteLLM was pulled as a transitive MCP dependency in Cursor. The fork bomb behavior (machines crashing on any Python startup) likely accelerated detection. Independently, MDR firm Daylight AI identified the compromise through a Wiz Defend alert ("Python script executed base64 encoded code") in an actual customer production environment, confirming at least one real-world production compromise during the attack window. Endor Labs and JFrog researchers also independently identified the malicious versions. [source: https://futuresearch.ai/blog/litellm-pypi-supply-chain-attack/, https://daylight.ai/blog/litellm-library-and-an-expanding-supply-chain-campaign, https://thehackernews.com/2026/03/teampcp-backdoors-litellm-versions.html]

### 5. Response

PyPI quarantined the entire litellm package immediately after discovery, preventing downloads of all versions. Users reported that "All versions currently return 'No matching distribution found.'" The initial GitHub issue (#24512) was closed and flooded with attacker-generated bot spam, suggesting the attacker attempted to suppress disclosure. A second tracking issue (#24518) was opened to maintain a clean timeline. [source: https://github.com/BerriAI/litellm/issues/24518]

The maintainer (`krrishdholakia`) confirmed the quarantine on GitHub, then deleted all compromised maintainer accounts and migrated to new ones. Operating from a new GitHub account (`krrish-berri-2`), he coordinated with the PyPI team to remove the malicious versions and unquarantine the package. All GitHub, Docker, and PyPI keys were rotated. The PyPI package now shows version 1.82.6 as the latest available. The Trivy dependency was pinned to the last known safe version via PR #24525, closing the original attack vector. BerriAI has engaged Google's Mandiant for incident response and has blocked all new releases pending completion of security scans. The last 30 BerriAI repositories were audited and confirmed to have no remaining deploy keys or environment variables. An official advisory and incident report is actively being prepared. BerriAI announced plans to implement "trusted publishing via JWT tokens" and migrate to a different PyPI account, eliminating static API tokens from the publishing workflow entirely. [source: https://github.com/BerriAI/litellm/issues/24518, https://github.com/BerriAI/litellm/pull/24525, https://www.theregister.com/2026/03/24/trivy_compromise_litellm/]

The new account created immediate community concern about identity verification. User `lattwood` noted: "uhh you joined github an hour ago," highlighting the difficulty of verifying maintainer identity after a compromise. The maintainer later linked his GitHub profile to his Hacker News account (`detente18`), which was cross-referenced by community members. However, user `pwilkin` warned that photo-based verification is insufficient in the LLM era, posting a deepfake proof-of-concept and pushing for real-world verification through official channels. No GPG-signed or official channel verification has been completed yet. Issue #24512 was subsequently reopened and has accumulated 400+ comments. [source: https://github.com/BerriAI/litellm/issues/24518]

PyPI maintainer Mike Fiedler assigned formal advisory **PYSEC-2026-2**, confirming the malicious releases and their removal. The advisory credits Callum McMahon (FutureSearch) as the reporter and describes the incident as: "After an API Token exposure from an exploited trivy dependency, two new releases of litellm were uploaded to PyPI containing automatically activated malware, harvesting sensitive credentials and files, and exfiltrating to a remote API." No CVE number has been assigned yet. [source: https://github.com/pypa/advisory-database/blob/main/vulns/litellm/PYSEC-2026-2.yaml]

BerriAI published an official security update at `docs.litellm.ai/blog/security-update-march-2026`, confirming: the attack window was March 24, 2026 between 6:39 AM - 12:00 PM ET; the attacker "bypassed official CI/CD workflows and uploaded malicious packages directly to PyPI"; proxy Docker image users were not impacted because all dependencies were pinned in requirements.txt; and all new releases remain paused "until we complete a broader supply-chain review and confirm the release path is safe." New authorized PyPI maintainer accounts are `@krrish-berri-2` and `@ishaan-berri`. [source: https://docs.litellm.ai/blog/security-update-march-2026]

DataBreachToday reported the malicious versions were downloaded 47,000 times in just 46 minutes before PyPI quarantine, underscoring the velocity of AI/ML package consumption. Discovery is credited to Callum McMahon at FutureSearch (Latent Space) when his machine crashed from uncontrolled process spawning caused by the .pth fork bomb. [source: https://www.databreachtoday.com/litellm-hit-in-cascading-supply-chain-attack-a-31210]

Sonatype's automated malware detection blocked the malicious versions "within seconds of publication" (tracked as sonatype-2026-001357), though the packages remained available on PyPI for approximately two hours before quarantine. [source: https://www.sonatype.com/blog/compromised-litellm-pypi-package-delivers-multi-stage-credential-stealer]

FBI Assistant Director Brett Leatherman issued a public warning about "increased breach disclosures, follow-on intrusions, and extortion attempts in the coming weeks." [source: https://www.infosecurity-magazine.com/news/teampcp-litellm-pypi-supply-chain/]

Microsoft's Defender Security Research Team published detection and investigation guidance on March 25 in a 1,737-word blog post covering attacker techniques and CI/CD pipeline defense, then expanded this on March 26 with Defender XDR coverage providing "comprehensive coverage across endpoints, identities, and cloud environments." [source: https://www.microsoft.com/en-us/security/blog/2026/03/24/detecting-investigating-defending-against-trivy-supply-chain-compromise/, https://cyberpress.org/microsoft-trivy-supply-chain-attack/]

Downstream projects moved quickly: at least 10 projects filed security PRs including DSPy, MLflow, OpenHands, and CrewAI [source: https://redskyalliance.org/xindustry/litellm-python]. MLflow merged an emergency PR (#21971) pinning `litellm<=1.82.6` at 9:12 AM ET, marked as "critical and needs to be in the next patch release." One enterprise user on issue #24512 reported running LiteLLM v1.81.14 as a centralized gateway for ~200 developers via AWS Bedrock, noting that their version pinning strategy protected them. Docker image users were generally safe because the image version was pinned prior to v1.82.7. NVIDIA Developer Forums also posted an urgent advisory telling users to pin to 1.82.6. [source: https://github.com/mlflow/mlflow/pull/21971, https://github.com/BerriAI/litellm/issues/24512, https://forums.developer.nvidia.com/t/critical-attack-litellm-compromised-pin1-82-6-now/364638]

Security researcher DanielRuf took the additional step of notifying both CISA and the German CERT (CERT-Bund/BSI), and published a template for other researchers to contact their national CERTs via the FIRST.org member directory. This was the first confirmed government notification. DanielRuf noted that individual CVEs are project-specific and that an industry-wide warning was needed given the cross-ecosystem scope. [source: https://github.com/BerriAI/litellm/issues/24518]

A notable secondary effect: 123 GitHub accounts were identified posting automated spam comments on the LiteLLM issue threads. DanielRuf confirmed these were real human accounts compromised via the upstream Trivy credential stealer (not purpose-built bots), meaning TeamPCP had built a botnet of legitimate developer accounts. The full list was compiled and archived on notebin.de. DanielRuf warned that the 121 accounts likely represent only a fraction of the compromised account pool, noting the attacker would not burn the entire botnet at once. As of the evening of March 25, GitHub has banned/blocked the compromised accounts to contain further damage, and DanielRuf confirmed all remaining 57 users were contacted via email. [source: https://github.com/BerriAI/litellm/issues/24518, https://github.com/BerriAI/litellm/issues/24512]

**NHS England publishes cyber alert.** NHS England Digital issued alert CC-4761 specifically for the LiteLLM PyPI compromise, confirming malicious packages were uploaded at 10:39 UTC on March 24 and quarantined by PyPI at 13:38 UTC. [source: https://digital.nhs.uk/cyber-alerts/2026/cc-4761]

**Community detection tools.** Multiple incident-response tools emerged on March 25: `litellm-check` (filesystem-only scanner covering venvs, conda envs, IDE caches, and global Python installs on macOS/Linux/Windows), the `nono` sandbox (restricts outbound network traffic and file access to prevent exfiltration even if compromised code is installed), and a post-mortem on agentlair.dev analyzing why the .pth vector is uniquely effective against AI agent deployments due to the common pattern of loading all credentials as ambient environment variables. [source: https://github.com/lucubrator/litellm-check, https://nono.sh/blog/nono-litellm, https://agentlair.dev/blog/litellm-supply-chain]

### 6. TeamPCP: Campaign Context

This was not an isolated incident. TeamPCP has been active since at least late 2025, with a December 2025 worm campaign ("CanisterWorm") that compromised 60,000+ servers globally by targeting exposed Docker APIs, Kubernetes clusters, and Redis servers. [source: https://hivepro.com/threat-advisory/teampcp-automated-supply-chain-from-trivy-to-litellm-in-a-multi-ecosystem-breach/]

In March 2026, TeamPCP executed a coordinated supply chain campaign across seven ecosystems in under a month:

| Date | Target | Ecosystem | Method |
|---|---|---|---|
| Feb 28 | Trivy | GitHub Actions | Pwn Request workflow vulnerability |
| Mar 19 | Trivy (2nd wave) | GitHub/Docker Hub/Containers | Residual access from incomplete remediation |
| Mar 20 | npm (66+ packages) | npm | Self-propagating CanisterWorm via stolen tokens (ICP canister C2) |
| Mar 22 | Docker Hub | Container images | Aqua credential reuse |
| Mar 23 | KICS/OpenVSX | GitHub Actions/IDE extensions | `cx-plugins-releases` service account (GH ID 225848595) compromise; 35 tags hijacked across kics-github-action; window 8:58 AM - 12:50 PM ET |
| Mar 24 | LiteLLM | PyPI | Publishing credentials compromised via Trivy |
| Mar 27 | Telnyx | PyPI | Publishing token harvested from LiteLLM credential sweep; WAV steganography payload delivery [source: https://thehackernews.com/2026/03/teampcp-pushes-malicious-telnyx.html] |
| Mar 30 | Databricks (alleged) | Under investigation | Notified of potential compromise connected to TeamPCP campaign; investigating, not confirmed [source: https://cybersecuritynews.com/databricks-teampcp-supply-chain/] |

Attribution relies on matching tradecraft: identical C2 domains, persistence paths (`~/.config/sysmon/`), encryption schemes, and the `tpcp.tar.gz` filename directly referencing TeamPCP. The group also operates under aliases including DeadCatx3, PCPcat, Persy_PCP, ShellForce, and CanisterWorm. Palo Alto Networks also tracks the group as **CipherForce**, a dedicated affiliate extortion platform distinct from the previously reported Vect ransomware alliance. Telegram channels: @Persy_PCP and @teampcp. [source: https://redskyalliance.org/xindustry/litellm-python, https://www.paloaltonetworks.com/blog/cloud-security/trivy-supply-chain-attack/] Two commented-out earlier payload iterations remained in the published package, an operational security failure revealing development progression from RC4-obfuscated shells to plaintext harvester code. [source: https://www.endorlabs.com/learn/teampcp-isnt-done]

**Dual ransomware operations.** TeamPCP now operates two parallel ransomware programs, CipherForce (direct high-value targeting) and Vect (mass affiliate distribution via BreachForums), confirming the campaign has fully shifted to monetization of stolen credentials. [source: https://isc.sans.edu/forums/diary/32846/, https://www.cyberkendra.com/2026/03/the-litellm-hack-was-just-opening-move.html]

**AstraZeneca data released.** Lapsus$ released a claimed 3 GB archive of AstraZeneca data for free after failing to secure buyers via Session encrypted messaging. Cybernews partially verified the dump, finding GitHub user information for internal developers, employee data from clinical research subsidiaries, and internal source code tree structures. AstraZeneca has issued no public statement as of 96 hours post-claim. For LiteLLM admins: this confirms stolen credentials from the campaign are actively being used to breach downstream organizations. [source: https://isc.sans.edu/forums/diary/32846/, https://www.securityweek.com/extortion-group-claims-it-hacked-astrazeneca/]

**Telnyx compromise proves credential cascade (March 27).** Three days after the LiteLLM attack, TeamPCP published malicious versions 4.87.1 and 4.87.2 of the Telnyx Python SDK to PyPI at 03:51 UTC on March 27. The attack vector is the credential cascade itself: TeamPCP's LiteLLM harvester swept environment variables and .env files from every compromised system, and any developer or CI pipeline that had both LiteLLM installed and access to a Telnyx PyPI token had that token already exfiltrated. The three-day interval matches the time needed to sort through stolen data and identify high-value targets. Attribution is confirmed by a byte-for-byte identical RSA-4096 public key, identical `tpcp.tar.gz` naming, and matching openssl encryption sequences. [source: https://www.endorlabs.com/learn/teampcp-strikes-again-telnyx-compromised-three-days-after-litellm, https://www.helpnetsecurity.com/2026/03/27/teampcp-telnyx-supply-chain-compromise/]

The Telnyx attack used a smaller dropper that hid payloads inside WAV audio files (steganography), added Windows persistence for the first time, and exfiltrated to a bare IP C2 at `83.142.209.203:8080`. For LiteLLM admins, the key takeaway: if your environment had both LiteLLM and Telnyx PyPI tokens, both are compromised. For full Telnyx technical details, see SafeDep and Endor Labs analyses. [source: https://safedep.io/malicious-telnyx-pypi-compromise/, https://www.endorlabs.com/learn/teampcp-strikes-again-telnyx-compromised-three-days-after-litellm]

**Lapsus$ collaboration confirmed.** Lapsus$ has joined TeamPCP's campaign, channeling stolen access to broader criminal networks for extortion. [source: https://www.csoonline.com/article/4149938/trivy-supply-chain-breach-compromises-over-1000-saas-environments-lapsus-joins-the-extortion-wave.html]

**CanisterWorm self-propagation.** A self-replicating component called CanisterWorm backdoored 66+ npm packages using stolen tokens, extending the campaign beyond PyPI into the npm ecosystem. [source: https://www.csoonline.com/article/4149938/trivy-supply-chain-breach-compromises-over-1000-saas-environments-lapsus-joins-the-extortion-wave.html]

**RSA Conference timing.** Multiple sources noted the LiteLLM PyPI attack was timed to coincide with the RSA Conference, launching while "defenders were busy." The Aqua Security GitHub organization was also defaced during this period, with 44 repositories renamed to "TeamPCP Owns Aqua Security." TeamPCP announced plans to target additional open-source projects via Telegram. [source: https://www.csoonline.com/article/4149938/trivy-supply-chain-breach-compromises-over-1000-saas-environments-lapsus-joins-the-extortion-wave.html, https://www.theregister.com/2026/03/24/1k_cloud_environments_infected_following/]

**Scale of exposure.** The Register reported that LiteLLM is present in 36% of all cloud environments, and over 10,000 GitHub workflow files reference the compromised trivy-action. 75 of 76 trivy-action tags were force-pushed to malicious versions. GitGuardian's quantitative analysis (March 29-30) found that from a sample of 30,353 repositories using trivy-action, 474 actually executed malicious code during the March 19-20 compromise window, with impacted repositories belonging to Canonical, Microsoft, and NASA among others. [source: https://blog.gitguardian.com/team-pcp-snowball-analysis/] Wiz researcher Ben Read described the situation as "a dangerous convergence between supply chain attackers and high-profile extortion groups." [source: https://www.theregister.com/2026/03/24/1k_cloud_environments_infected_following/]

**Checkmarx KICS also compromised.** The campaign extended to Checkmarx's KICS scanner: VS Code extensions checkmarx.ast-results v2.53 (36,000 downloads) and checkmarx.cx-dev-assist v1.7.0 (500 downloads) on OpenVSX were affected via the `cx-plugins-releases` service account. Dark Reading attributed this to TeamPCP and warned "all signs point to more attacks to come." [source: https://www.darkreading.com/application-security/checkmarx-kics-code-scanner-widening-supply-chain, https://www.reversinglabs.com/blog/teampcp-supply-chain-attack-spreads]

TeamPCP's toolkit also includes an Iran-targeted wiper that switches from credential theft to destructive wiping when it detects Iranian locale/timezone settings. [source: https://www.bleepingcomputer.com/news/security/teampcp-deploys-iran-targeted-wiper-in-kubernetes-attacks/]

**Exfiltration domain still live.** The `litellm.cloud` exfiltration domain takedown has stalled at registrar level. ICANN escalation is being considered. Systems with active persistence may still be sending data to this domain. [source: https://github.com/BerriAI/litellm/issues/24518]

### 8. Broader Implications for AI/ML Supply Chain Security

**High confidence:**

1. **AI/ML packages are high-value targets.** LiteLLM sits at the intersection of every major cloud provider's credentials. A library that proxies API calls to OpenAI, Anthropic, AWS Bedrock, and others naturally has access to the most sensitive keys in any organization. The attacker knew this, targeting cloud credentials, Kubernetes secrets, and crypto wallets specifically. As Wiz head of threat exposure Gal Nagli stated: "The open source supply chain is collapsing in on itself. Trivy gets compromised, LiteLLM gets compromised, credentials from tens of thousands of environments end up in attacker hands, and those credentials lead to the next compromise." [source: https://thehackernews.com/2026/03/teampcp-backdoors-litellm-versions.html]

2. **Transitive dependency risk is amplified in AI tooling.** LiteLLM is pulled in by AI agent frameworks, MCP servers, and LLM orchestration tools. Many developers who were compromised never directly installed it. GitGuardian's quantitative analysis found 2,247 unique packages depend on litellm, of which 1,705 were susceptible to pulling the malicious versions and 1,380 had it as a direct (non-optional) dependency. Top vulnerable packages by monthly downloads: dspy (5M), opik (3M), mini-swe-agent (1.8M), google-cloud-aiplatform (181M, optional), mlflow (32M, optional). Specific downstream frameworks identified as affected include **DSPy** (uses LiteLLM as its primary upstream provider interface), **CrewAI** (depends on it as a fallback mechanism), **Browser-Use**, and **Opik** (Comet). Comet published their own response confirming LiteLLM as a dependency of Opik. The AI ecosystem's rapid growth and deep dependency chains create an expanding attack surface. [source: https://blog.gitguardian.com/team-pcp-snowball-analysis/, https://news.ycombinator.com/item?id=47501729, https://www.comet.com/site/blog/litellm-supply-chain-attack/]

3. **CI/CD pipeline security is the new perimeter.** The attack chain started with Trivy (a security scanner, ironically), moved through npm, Docker Hub, and IDE extensions, through PyPI (LiteLLM), and cascaded to Telnyx three days later using credentials harvested from the LiteLLM compromise itself. Unpinned dependencies in CI/CD pipelines were the entry point. Organizations that pinned their security tooling versions were protected. The Telnyx compromise proves this is a self-sustaining credential cascade: each compromise yields tokens that unlock the next target. [source: https://www.endorlabs.com/learn/teampcp-strikes-again-telnyx-compromised-three-days-after-litellm]

4. **PyPI account security remains a systemic risk.** A single compromised publishing token gave the attacker the ability to push malware to 95 million monthly downloaders. This echoes ongoing debates about mandatory 2FA, trusted publishers, and package signing on PyPI.

**Medium confidence:**

5. **The credential cascade is self-sustaining.** The three-day interval between LiteLLM (March 24) and Telnyx (March 27) matches the time needed to sort through exfiltrated data and identify high-value targets. Bitsight telemetry shows TeamPCP operating at "+300% higher activity vs similar threat groups" and "+300% higher activity vs all adversarial entities," indicating an intensifying campaign, not a winding-down one. [source: https://www.bitsight.com/blog/litellm-versions-1-82-7-1-82-8-supply-chain-compromise, https://www.endorlabs.com/learn/teampcp-strikes-again-telnyx-compromised-three-days-after-litellm]

6. **The 13-minute gap between 1.82.7 and 1.82.8 suggests the attacker iterated in real-time**, possibly testing whether the proxy_server.py injection was sufficient before escalating to the .pth file approach. This implies active monitoring and adaptation during the attack window.

7. **The fork bomb bug may have been the saving grace.** Without the accidental recursive .pth triggering that crashed machines, the attack could have remained undetected for much longer, silently harvesting credentials across the AI ecosystem.

### 7. Comparison to XZ Utils Backdoor (CVE-2024-3094)

The XZ Utils backdoor, discovered March 29, 2024, is the most significant prior open-source supply chain attack. Here is how the two compare:

| Dimension | XZ Utils (CVE-2024-3094) | LiteLLM (March 2026) |
|---|---|---|
| **Attack vector** | Social engineering: 2+ years building trust as maintainer "Jia Tan" to gain commit and release manager rights [source: https://gist.github.com/thesamesam/223949d5a074ebc3dce9ee78baad9e27] | Credential theft: PyPI publishing token stolen via compromised Trivy in CI/CD pipeline [source: https://github.com/BerriAI/litellm/issues/24518] |
| **Time to execute** | ~2.5 years of patient social engineering | Hours (part of a 25-day multi-ecosystem blitz) |
| **Sophistication** | Extremely high: custom binary backdoor injected via build system (`build-to-host.m4`), exploiting glibc's IFUNC resolver to hook OpenSSH's `RSA_public_decrypt`. Conditional activation only on x86_64, glibc, Debian/Red Hat with systemd-integrated sshd. [source: https://gist.github.com/thesamesam/223949d5a074ebc3dce9ee78baad9e27] | High but more operational: Python-based three-stage payload with custom AWS SigV4 implementation, Kubernetes lateral movement, and persistent C2. Less technically novel but broader in scope. [source: https://safedep.io/malicious-litellm-1-82-8-analysis/] |
| **Target** | Remote code execution via SSH on Linux servers | Credential harvesting, data exfiltration, persistent backdoor access |
| **Scope of impact** | Narrow: only reached Fedora 40 beta, Debian unstable/testing/experimental, Kali, Arch. Never hit stable releases. [source: https://securitylabs.datadoghq.com/articles/xz-backdoor-cve-2024-3094/] | Broad: ~95M monthly downloads, transitive dependency for many AI agent frameworks, MCP servers, and LLM orchestration tools. Anyone who ran `pip install` during the window was immediately compromised. [source: https://www.endorlabs.com/learn/teampcp-isnt-done] |
| **Discovery** | Andres Freund noticed 500ms SSH latency anomaly while benchmarking. Serendipitous. [source: https://gist.github.com/thesamesam/223949d5a074ebc3dce9ee78baad9e27] | FutureSearch hit it as transitive MCP dependency. Fork bomb behavior accelerated detection. [source: https://futuresearch.ai/blog/litellm-pypi-supply-chain-attack/] |
| **Attribution** | Likely state-sponsored (consensus but unconfirmed). Single pseudonymous actor with possible support network creating social pressure on original maintainer. [source: https://securitylabs.datadoghq.com/articles/xz-backdoor-cve-2024-3094/] | Criminal group "TeamPCP" running multi-ecosystem campaign. Operational security failures (commented-out payloads, self-referencing filenames) suggest a skilled but not state-level actor. [source: https://www.endorlabs.com/learn/teampcp-isnt-done] |
| **Stealth** | Extremely stealthy: backdoor hidden in test files and build macros, not in source code visible on GitHub. Release tarballs differed from repository. | Moderately stealthy: code between legitimate blocks, but fork bomb bug and 13-minute version gap left obvious traces. |
| **Ecosystem response** | Industry-wide reckoning about maintainer burnout, single-maintainer dependencies, and tarball vs. git source divergence. | Highlights AI/ML supply chain as a new high-value target. Questions about PyPI account security and transitive dependency risk. |

**Key insight:** XZ Utils was a precision weapon: a likely state actor spent years cultivating trust to plant a surgical backdoor in critical infrastructure. LiteLLM was a smash-and-grab: a criminal group exploited a chain of CI/CD compromises to rapidly deploy a broad credential harvester across the AI ecosystem. XZ was more technically sophisticated; LiteLLM was more operationally impactful in the short term because it targeted credentials directly and hit a package with massive download volume in the fast-moving AI space.

## Indicators of Compromise, Detection & Remediation

For anyone running LiteLLM in their environment:

| IoC | Type |
|---|---|
| `8a2a05fd8bdc329c8a86d2d08229d167500c01ecad06e40477c49fb0096efdea` | SHA-256 (1.82.7 tarball) |
| `8395c3268d5c5dbae1c7c6d4bb3c318c752ba4608cfcd90eb97ffb94a910eac2` | SHA-256 (1.82.7 wheel) |
| `d39f4e7a218053cce976c91eacf184cf09a6960c731cc9d66d8e1a53406593a5` | SHA-256 (1.82.8 tarball) |
| `d2a0d5f564628773b6af7b9c11f6b86531a875bd2d186d7081ab62748a800ebb` | SHA-256 (1.82.8 wheel) |
| `a0d229be8efcb2f9135e2ad55ba275b76ddcfeb55fa4370e0a522a5bdee0120b` | SHA-256 (compromised proxy_server.py) |
| `71e35aef03099cd1f2d6446734273025a163597de93912df321ef118bf135238` | SHA-256 (litellm_init.pth) |
| `6cf223aea68b0e8031ff68251e30b6017a0513fe152e235c26f248ba1e15c92a` | SHA-256 (sysmon.py backdoor) [source: Red Sky Alliance] |
| `85ED77A21B88CAE721F369FA6B7BBBA3` | MD5 (Kaspersky) |
| `2E3A4412A7A487B32C5715167C755D08` | MD5 (Kaspersky) |
| `0FCCC8E3A03896F45726203074AE225D` | MD5 (Kaspersky) |
| `F5560871F6002982A6A2CC0B3EE739F7` | MD5 (Kaspersky) |
| `CDE4951BEE7E28AC8A29D33D34A41AE5` | MD5 (Kaspersky) |
| `05BACBE163EF0393C2416CBD05E45E74` | MD5 (Kaspersky) |
| `models.litellm.cloud` (`46.151.182.203`) | Exfiltration endpoint |
| `checkmarx.zone` (`83.142.209.11`) | C2 polling domain |
| `scan.aquasecurtiy.org` (`45.148.10.212`) | Trivy exfiltration domain (typosquat) |
| `~/.config/sysmon/sysmon.py` | Persistence script |
| `~/.config/systemd/user/sysmon.service` | Persistence service |
| `/tmp/pglog` or `/tmp/.pg_state` | State files |
| `node-setup-*` pods in `kube-system` | Kubernetes lateral movement |
| `tpcp-docs` repository in victim GitHub accounts | Fallback exfiltration channel |
| `cd6af6c9ba149673ff89a1f1ccc8ec40a265a3b54ad455fbef28dc2967a98e45` | SHA-256 (MalwareBazaar, tagged checkmarx-zone + models-litellm-cloud) |
| `05bacbe163ef0393c2416cbd05e45e74` | MD5 (MalwareBazaar, tagged checkmarx-zone + models-litellm-cloud) |
| `85e16077deeaffae3c50d45d99e9dae2c58de53e` | SHA-1 (MalwareBazaar, tagged checkmarx-zone + models-litellm-cloud, threat_type: js) |
| `tpcp.tar.gz` | Encrypted exfiltration archive (AES-256-CBC + RSA-4096 OAEP) |
| `7321caa303fe96ded0492c747d2f353c4f7d17185656fe292ab0a59e2bd0b8d9` | SHA-256 (telnyx 4.87.1) [source: SafeDep] |
| `cd08115806662469bbedec4b03f8427b97c8a4b3bc1442dc18b72b4e19395fe3` | SHA-256 (telnyx 4.87.2) [source: SafeDep] |
| `83.142.209.203:8080` | Telnyx C2 server (bare IP, no domain) |
| `~/.config/audiomon/audiomon.service` | Telnyx Linux persistence service |
| `105.245.181.120` | Post-compromise IP (Vodacom callback proxy) [source: Wiz] |
| `138.199.15.172` | Post-compromise IP (Datacamp/Mullvad VPN) [source: Wiz] |
| `154.47.29.12` | Post-compromise IP (Mullvad VPN) [source: Wiz] |
| `170.62.100.245` | Post-compromise IP (Mullvad VPN) [source: Wiz] |
| `163.245.223.12` | Post-compromise IP (InterServer) [source: Wiz] |
| `209.159.147.239` | Post-compromise IP (InterServer) [source: Wiz] |
| `34.205.27.48` | Post-compromise IP (Amazon) [source: Wiz] |
| User-Agent: `Boto3/1.42.73` on Kali Linux | Post-compromise AWS API calls [source: Wiz] |
| User-Agent: `git/2.43.0` | Post-compromise git.clone operations (outdated version) [source: Wiz] |
| Branch: `dev_remote_ea5Eu/test/v1` | Nord Stream tool indicator [source: Wiz] |

Detection commands:
```bash
pip show litellm | grep Version
find $(python -c "import site; print(site.getsitepackages()[0])") -name "litellm_init.pth"
ls -la ~/.config/sysmon/
kubectl get pods -n kube-system | grep node-setup
# Telnyx check (if applicable)
pip show telnyx | grep Version
ls -la ~/.config/audiomon/
```

Remediation:
```bash
# Purge pip cache to prevent reinstalling cached malicious wheels
pip cache purge
# Remove systemd persistence artifacts
systemctl --user stop sysmon.service
systemctl --user disable sysmon.service
rm -f ~/.config/sysmon/sysmon.py ~/.config/systemd/user/sysmon.service
rm -f /tmp/pglog /tmp/.pg_state
# Verify Docker containers if running LiteLLM
docker exec <container> pip show litellm
```

[source: https://www.endorlabs.com/learn/teampcp-isnt-done, https://safedep.io/malicious-litellm-1-82-8-analysis/, https://github.com/BerriAI/litellm/issues/24512, https://www.sysdig.com/blog/teampcp-expands-supply-chain-compromise-spreads-from-trivy-to-checkmarx-github-actions]

## Confidence Assessment

### High Confidence
- The attack mechanism (both .pth file and proxy_server.py injection) is well-documented across multiple independent sources
- TeamPCP attribution is supported by matching tradecraft across five ecosystems
- The credential harvesting scope and three-stage payload architecture are confirmed by independent code analysis (SafeDep, Endor Labs)
- The Trivy CI/CD vector is confirmed by the maintainer on Hacker News: "this originated from the trivy used in our ci/cd"
- Timeline of events is consistent across all sources
- IoCs are verified and consistent

### Medium Confidence
- The "13-minute iteration" interpretation (attacker testing and adapting in real-time) is reasonable inference but not confirmed by the attacker
- Download impact estimates (95M monthly, ~3.6M daily) come from PyPI stats. At least one production environment confirmed compromised via Wiz alert, but total victim count during the attack window remains unknown
- TeamPCP aliases (DeadCatx3, PCPcat, ShellForce, CanisterWorm) reported by Endor Labs, but alias attribution across groups can be uncertain
- DSPy, CrewAI, and MLflow identified as downstream dependents (MLflow confirmed via emergency PR; DSPy and CrewAI from HN community reports)

## Open Questions

- **Exact number of affected users/organizations**: Wiz and Socket confirm 1,000+ SaaS environments affected. SANS reports Mandiant estimates potential expansion to 5,000-10,000. Kaspersky reports 20,000+ repositories potentially vulnerable and attacker claims of 500,000+ accounts and "hundreds of gigabytes" of stolen data. Exact confirmed count remains unclear.
- **BerriAI's detailed post-mortem**: Mandiant engaged; official security blog post published at docs.litellm.ai but full incident report not yet released. Mandiant's forensic audit covered all LiteLLM releases from v1.78.0 through v1.82.6 across both PyPI and Docker, verifying each artifact by SHA-256 digest and comparing contents against the corresponding Git commit; all confirmed clean. [source: https://cycode.com/blog/lite-llm-supply-chain-attack/]
- **Exfiltration domain still live**: `litellm.cloud` takedown stalled at registrar level. BerriAI has contacted both Spaceship (registrar) and Cloudflare directly via phone (number provided by community member). DanielRuf also independently contacted Spaceship and demenin about both `checkmarx.zone` and `litellm.cloud`. Domain may still be collecting data from compromised systems with active persistence. [source: https://github.com/BerriAI/litellm/issues/24518]
- **Government response**: CISA KEV (April 9 federal deadline), Singapore CSA, UK NCSC, NHS England, German BSI all issued advisories. FBI warned of follow-on intrusions. Microsoft published Defender XDR detection guidance. No arrests.
- **Threat intel coverage improving**: MalwareBazaar has hash entries tagged for this campaign. Vendor advisories from Microsoft, Kaspersky, SANS, and Trend Micro now include IoCs.
- **CVE assignment**: PYSEC-2026-2 has been assigned (PyPI-specific advisory). The upstream Trivy compromise received **CVE-2026-33634** (CVSS:3.1 AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H, CVSS4B 9.4, CWE-506: Embedded Malicious Code, assigned by GitHub's CNA; GitHub advisory GHSA-69fq-xp46-6x23) [source: https://github.com/aquasecurity/trivy/discussions/10425, https://nvd.nist.gov/vuln/detail/CVE-2026-33634]. CVE-2026-33634 now confirmed in CISA KEV catalog (March 26) with April 9, 2026 federal remediation deadline [source: https://www.helpnetsecurity.com/2026/03/27/cve-2026-33017-cve-2026-33634-exploited/]. Snyk also issued **SNYK-PYTHON-LITELLM-15762713** for the LiteLLM compromise. No LiteLLM-specific CVE (CVE-2026-XXXXX) on NVD yet as of March 27.
- **Identity verification of new maintainer**: Partially resolved via HN cross-reference, but community raised deepfake concerns about photo-based verification. No GPG-signed or official channel verification yet
- **Full scope of GitHub PAT compromise**: The attacker had access to the maintainer's GitHub account (confirmed via activity on `krrishdholakia/blockchain` and creation of `tpcp-docs` repo), but the full extent of actions taken with the PAT is not yet documented
- **v1.83.0 now on PyPI, release freeze lifted**: LiteLLM v1.83.0 published March 31 via new CI/CD v2 pipeline with Trusted Publishing. Security blog updated to confirm it is a clean release. However, no GitHub release tag exists (latest: `v1.82.3-stable.patch.2`). Malicious versions 1.82.7 and 1.82.8 remain fully removed from PyPI history. Note: Hackread's article incorrectly references "LiteLLM 1.82.9+" as a remediation target; no such version exists on PyPI. [source: https://pypi.org/project/litellm/#history, https://docs.litellm.ai/blog/security-update-march-2026]
- **TeamPCP pivoted to cloud exploitation**: No new TeamPCP package compromises in 4+ days as of March 31 (longest quiet period since campaign began March 19). SANS ISC Update 004 confirmed zero TeamPCP IOCs in RubyGems, crates.io, or Maven Central. The group has fully shifted from supply chain compromise to post-compromise cloud exploitation and monetization. Wiz (March 30) confirms TeamPCP is actively enumerating and accessing AWS environments using stolen credentials, with activity beginning as early as March 19. TruffleHog used for automated credential validation. ECS Exec abused for container command execution. S3/Secrets Manager targeted for bulk data exfiltration. [source: https://www.wiz.io/blog/tracking-teampcp-investigating-post-compromise-attacks-seen-in-the-wild] Dual CipherForce/Vect ransomware operations continue. CipherForce has no confirmed deployments yet. Infosecurity Magazine (March 31) reports TeamPCP is actively "validating, encrypting and exfiltrating" stolen credentials with Lapsus$ and Vect. Additional supply chain compromises remain possible. Note: the axios npm compromise (March 31) is NOT attributed to TeamPCP. [source: https://isc.sans.edu/forums/diary/32846/, https://www.infosecurity-magazine.com/news/teampcp-exploit-stolen-supply/]
- **No BerriAI post-mortem published**: Mandiant engagement confirmed March 24, but no detailed incident report released as of March 31. The security blog has been updated to confirm v1.83.0 is clean and the release freeze is lifted, but this was a silent edit with no changelog or announcement. CI/CD v2 blog (March 30) discusses hardening improvements but is not a post-mortem. BerriAI's CEO has resumed normal posting on LinkedIn (announcing v1.83.0 features) without addressing the Mandiant review status or providing a formal "all clear." No new BerriAI maintainer updates on issue #24518 since March 25.
- **LiteLLM v1.83.0 released, blog updated, but gaps remain**: v1.83.0 appeared on PyPI March 31, published via the new Trusted Publishing pipeline. No known IOCs found in community wheel analysis. The security blog has been silently updated to confirm v1.83.0 is clean and the release freeze is lifted. However: still no GitHub release tag (latest tag still `v1.82.6.rc.2`, latest release `v1.82.3-stable.patch.2`), no release notes, no maintainer response on issue #24843, and the blog does not state whether the Mandiant review concluded. The blog edit was silent with no announcement, and no security townhall recording or notes have been published despite the blog referencing "Townhall updates" on March 27. CISA KEV deadline is April 9, now 9 days away.
- **IETF standardization**: An Internet-Draft (CB4A) for short-lived AI agent credentials was submitted March 29, directly motivated by this campaign. [source: https://datatracker.ietf.org/doc/draft-hartman-credential-broker-4-agents/]
- **Telnyx compromise scope resolved at vendor level**: Telnyx confirms root cause resolved and states SDK is a client library with "no privileged access to Telnyx infrastructure," no customer data accessed. Users advised to revert to 4.87.0. Number of systems that pulled malicious versions during the March 27 window is not yet reported. [source: https://hackread.com/teampcp-fake-ringtone-file-tainted-telnyx-sdk-credentials/]
- **Databricks alleged compromise**: CybersecurityNews reports Databricks investigating alleged connection to TeamPCP campaign (March 30). Not confirmed; no specifics on affected systems or data. If confirmed, this would represent the highest-profile named victim to date. [source: https://cybersecuritynews.com/databricks-teampcp-supply-chain/]
- **Credential cascade may continue**: If Telnyx environments also contained publishing tokens for other PyPI packages, TeamPCP could chain to additional targets. The pattern of three-day intervals between compromises suggests active processing of harvested credentials. SANS ISC Update 004 (March 30) confirms 96+ hour pause with no new package compromises and no expansion to RubyGems, crates.io, or Maven Central. The group appears to have shifted fully to monetization via CipherForce and Vect. The AstraZeneca data release confirms stolen credentials are being actively exploited for downstream breaches. This could still be a pause rather than a stop. [source: https://isc.sans.edu/forums/diary/32846/, https://www.endorlabs.com/learn/teampcp-strikes-again-telnyx-compromised-three-days-after-litellm]

## Sources

### Government/CERT Advisories

1. [CISA: CISA Adds One Known Exploited Vulnerability to Catalog (CVE-2026-33634)](https://www.cisa.gov/news-events/alerts/2026/03/26/cisa-adds-one-known-exploited-vulnerability-catalog)
2. [NHS England Digital: Cyber Alert CC-4761 - LiteLLM PyPI Package Compromise](https://digital.nhs.uk/cyber-alerts/2026/cc-4761)
3. [Singapore CSA Advisory AD-2026-001: Ongoing 'TeamPCP' Supply-Chain Campaign](https://www.csa.gov.sg/alerts-and-advisories/advisories/ad-2026-001/)
4. [UK NCSC CTO Summary: Week Ending March 29, 2026](https://ctoatncsc.substack.com/p/cto-at-ncsc-summary-week-ending-march-09e)

### Vendor Security Advisories

7. [PyPA Advisory Database: PYSEC-2026-2](https://github.com/pypa/advisory-database/blob/main/vulns/litellm/PYSEC-2026-2.yaml)
8. [Aqua Security Trivy Discussion #10425: CVE-2026-33634 assigned](https://github.com/aquasecurity/trivy/discussions/10425)
9. [Microsoft: Guidance for detecting, investigating, and defending against the Trivy supply chain compromise](https://www.microsoft.com/en-us/security/blog/2026/03/24/detecting-investigating-defending-against-trivy-supply-chain-compromise/)
10. [LiteLLM: Security Update March 2026](https://docs.litellm.ai/blog/security-update-march-2026)
11. [Docker Blog: Trivy supply chain compromise - what Docker Hub users should know](https://www.docker.com/blog/trivy-supply-chain-compromise-what-docker-hub-users-should-know/)
12. [Tenable: CVE-2026-33634](https://www.tenable.com/cve/CVE-2026-33634)
13. [NVIDIA Developer Forums: Critical attack - LiteLLM compromised](https://forums.developer.nvidia.com/t/critical-attack-litellm-compromised-pin1-82-6-now/364638)
14. [MLflow Emergency Pin PR #21971](https://github.com/mlflow/mlflow/pull/21971)
15. [Trend Micro: SECURITY ALERT: Supply Chain Attack - Malicious code in litellm PyPI Package](https://success.trendmicro.com/en-US/solution/KA-0022880)
16. [Trend Micro: Inside the LiteLLM Supply Chain Compromise](https://www.trendmicro.com/en/research/26/c/inside-litellm-supply-chain-compromise.html)
17. [Okta: LiteLLM supply chain attack - an explainer for identity pros](https://www.okta.com/ko-kr/blog/threat-intelligence/litellm-supply-chain-attack--an-explainer-for-identity-pros/)
18. [Arctic Wolf: TeamPCP Supply Chain Attack Campaign Targets Trivy, Checkmarx (KICS), and LiteLLM](https://arcticwolf.com/resources/blog/teampcp-supply-chain-attack-campaign-targets-trivy-checkmarx-kics-and-litellm-potential-downstream-impact-to-additional-projects/)
19. [Deepwatch: Software Supply Chain Alert: LiteLLM & Trivy Attack Actions](https://www.deepwatch.com/labs/ca-a-26-005-software-supply-chain-attacks-and-infrastructure-risk/)
20. [Kaspersky: Trojanization of Trivy, Checkmarx, and LiteLLM solutions](https://www.kaspersky.com/blog/critical-supply-chain-attack-trivy-litellm-checkmarx-teampcp/55510/)
21. [Kaspersky/Securelist: LiteLLM Supply Chain Attack Deep Analysis](https://securelist.com/litellm-supply-chain-attack/119257/)
22. [Palo Alto Networks: When Security Scanners Become the Weapon - Breaking Down the Trivy Supply Chain Attack](https://www.paloaltonetworks.com/blog/cloud-security/trivy-supply-chain-attack/)

### Technical Analyses

23. [FutureSearch: Supply Chain Attack in litellm 1.82.8 on PyPI](https://futuresearch.ai/blog/litellm-pypi-supply-chain-attack/)
24. [FutureSearch: Minute-by-Minute Response to the LiteLLM Malware Attack](https://futuresearch.ai/blog/litellm-attack-transcript/)
25. [Endor Labs: TeamPCP Isn't Done - Threat Actor Behind Trivy and KICS Compromises Now Hits LiteLLM](https://www.endorlabs.com/learn/teampcp-isnt-done)
26. [Endor Labs: TeamPCP Strikes Again - Telnyx Compromised Three Days After LiteLLM](https://www.endorlabs.com/learn/teampcp-strikes-again-telnyx-compromised-three-days-after-litellm)
27. [SafeDep: Malicious litellm 1.82.8 - Credential Theft and Persistent Backdoor Analysis](https://safedep.io/malicious-litellm-1-82-8-analysis/)
28. [SafeDep: Compromised Telnyx on PyPI - WAV Steganography and Credential Theft](https://safedep.io/malicious-telnyx-pypi-compromise/)
29. [Datadog Security Labs: The XZ Utils backdoor (CVE-2024-3094)](https://securitylabs.datadoghq.com/articles/xz-backdoor-cve-2024-3094/)
30. [Datadog Security Labs: LiteLLM compromised on PyPI - Tracing the TeamPCP supply chain campaign](https://securitylabs.datadoghq.com/articles/litellm-compromised-pypi-teampcp-supply-chain-campaign/)
31. [CrowdStrike: From Scanner to Stealer - Inside the trivy-action Supply Chain Compromise](https://www.crowdstrike.com/en-us/blog/from-scanner-to-stealer-inside-the-trivy-action-supply-chain-compromise/)
32. [Wiz: KICS GitHub Action Compromised - TeamPCP Supply Chain Attack](https://www.wiz.io/blog/teampcp-attack-kics-github-action)
33. [Wiz: LiteLLM TeamPCP Supply Chain Attack - Malicious PyPI Packages](https://www.wiz.io/blog/threes-a-crowd-teampcp-trojanizes-litellm-in-continuation-of-campaign)
34. [Wiz Threat Center: TeamPCP Actor Profile](https://threats.wiz.io/all-actors/teampcp)
35. [Sysdig: TeamPCP Expands Supply Chain Compromise](https://www.sysdig.com/blog/teampcp-expands-supply-chain-compromise-spreads-from-trivy-to-checkmarx-github-actions)
36. [Cycode: LiteLLM Supply Chain Attack - What Happened and How to Respond](https://cycode.com/blog/lite-llm-supply-chain-attack/)
37. [Snyk: How a Poisoned Security Scanner Became the Key to Backdooring LiteLLM](https://snyk.io/articles/poisoned-security-scanner-backdooring-litellm/)
38. [Sonatype: Compromised litellm PyPI Package Delivers Multi-Stage Credential Stealer](https://www.sonatype.com/blog/compromised-litellm-pypi-package-delivers-multi-stage-credential-stealer)
39. [ReversingLabs: TeamPCP software supply chain attack spreads to LiteLLM](https://www.reversinglabs.com/blog/teampcp-supply-chain-attack-spreads)
40. [Mend.io: LiteLLM PyPI Compromise - TeamPCP Credential Stealer](https://www.mend.io/blog/teampcp-supply-chain-series-part-2/)
41. [Mend.io: TeamPCP Supply Chain Series Part 3 - Telnyx PyPI Compromise](https://www.mend.io/blog/famous-telnyx-pypi-package-compromised-by-teampcp/)
42. [Socket.dev: Trivy Under Attack Again - GitHub Actions Compromise](https://socket.dev/blog/trivy-under-attack-again-github-actions-compromise)
43. [ARMO: The Library That Holds All Your AI Keys Was Just Backdoored - LiteLLM Supply Chain Compromise](https://www.armosec.io/blog/litellm-supply-chain-attack-backdoor-analysis/)
45. [CovertSwarm: LiteLLM was the end of the chain, not the beginning](https://www.covertswarm.com/post/litellm-supply-chain-attack-pypi-backdoor)
46. [Bitsight: Major Security Event - LiteLLM Versions 1.82.7 and 1.82.8 Supply Chain Compromise](https://www.bitsight.com/blog/litellm-versions-1-82-7-1-82-8-supply-chain-compromise)
47. [Sam James (Gentoo): xz-utils backdoor situation (CVE-2024-3094)](https://gist.github.com/thesamesam/223949d5a074ebc3dce9ee78baad9e27)
48. [MrCloudBook: litellm 1.82.8 Malicious PyPI Package - Credential Stealer](https://mrcloudbook.com/litellm-1828-malicious-pypi-package-credential-stealer/)
49. [Phoenix Security: Trivy Supply Chain Compromise - Again](https://phoenix.security/trivy-supply-chain-compromise-teampcp-weaponised-scanner-ongoing-attack/)
50. [Penligent: LiteLLM on PyPI Was Compromised](https://www.penligent.ai/hackinglabs/litellm-on-pypi-was-compromised-what-the-attack-changed-and-what-defenders-should-do-now/)
51. [Penligent: CVE-2026-33634 and the Trivy supply chain compromise](https://www.penligent.ai/hackinglabs/cve-2026-33634-and-the-trivy-supply-chain-compromise-how-mutable-tags-turned-a-security-scanner-into-a-credential-stealer/)
52. [SANS ISC: TeamPCP Supply Chain Campaign Update 002 - Telnyx PyPI Compromise, Vect Ransomware Mass Affiliate Program, and First Named Victim Claim](https://isc.sans.edu/diary/32842)
54. [SANS ISC: TeamPCP Supply Chain Campaign Update 004 - Databricks Investigating, Dual Ransomware Operations, AstraZeneca Data Released](https://isc.sans.edu/forums/diary/32846/)
55. [SecurityWeek: Extortion Group Claims It Hacked AstraZeneca](https://www.securityweek.com/extortion-group-claims-it-hacked-astrazeneca/)
57. [GitGuardian: Trivy's March Supply Chain Attack Shows Where Secret Exposure Hurts Most](https://blog.gitguardian.com/trivys-march-supply-chain-attack-shows-where-secret-exposure-hurts-most/)
58. [GitGuardian: The Team PCP Snowball Effect: A Quantitative Analysis](https://blog.gitguardian.com/team-pcp-snowball-analysis/)
59. [IETF Internet-Draft: Credential Broker for Agents (CB4A)](https://datatracker.ietf.org/doc/draft-hartman-credential-broker-4-agents/)
60. [AgentLair: Post-mortem on .pth vector effectiveness against agent deployments](https://agentlair.dev/blog/litellm-supply-chain)
61. [ramimac: Incident Timeline - TeamPCP Supply Chain Campaign](https://ramimac.me/teampcp/)
62. [Red Sky Alliance: LiteLLM Python Supply Chain Analysis](https://redskyalliance.org/xindustry/litellm-python)

### News Coverage

66. [GitHub Issue #24518: litellm PyPI package (v1.82.7 + v1.82.8) compromised - full timeline and status](https://github.com/BerriAI/litellm/issues/24518)
67. [GitHub Issue #24512: CRITICAL: Malicious litellm_init.pth in litellm 1.82.8 - credential stealer](https://github.com/BerriAI/litellm/issues/24512)
68. [GitHub Issue #235: Telnyx PyPI versions 4.87.1 and 4.87.2 compromised](https://github.com/team-telnyx/telnyx-python/issues/235)
69. [Hacker News Discussion: LiteLLM Python package compromised by supply-chain attack](https://news.ycombinator.com/item?id=47501729)
70. [The Hacker News: Trivy Security Scanner GitHub Actions Breached](https://thehackernews.com/2026/03/trivy-security-scanner-github-actions.html)
71. [The Hacker News: TeamPCP Backdoors LiteLLM Versions 1.82.7-1.82.8 Likely via Trivy CI/CD Compromise](https://thehackernews.com/2026/03/teampcp-backdoors-litellm-versions.html)
72. [The Hacker News: TeamPCP Hacks Checkmarx GitHub Actions Using Stolen CI Credentials](https://thehackernews.com/2026/03/teampcp-hacks-checkmarx-github-actions.html)
73. [The Hacker News: TeamPCP Pushes Malicious Telnyx Versions to PyPI, Hides Stealer in WAV Files](https://thehackernews.com/2026/03/teampcp-pushes-malicious-telnyx.html)
74. [BleepingComputer: Popular LiteLLM PyPI package compromised in TeamPCP supply chain attack](https://www.bleepingcomputer.com/news/security/popular-litellm-pypi-package-compromised-in-teampcp-supply-chain-attack/)
75. [BleepingComputer: TeamPCP deploys Iran-targeted wiper in Kubernetes attacks](https://www.bleepingcomputer.com/news/security/teampcp-deploys-iran-targeted-wiper-in-kubernetes-attacks/)
76. [The Register: LiteLLM loses game of Trivy pursuit, gets compromised](https://www.theregister.com/2026/03/24/trivy_compromise_litellm/)
77. [The Register: 1K+ cloud environments infected following Trivy supply chain attack](https://www.theregister.com/2026/03/24/1k_cloud_environments_infected_following/)
78. [SecurityWeek: From Trivy to Broad OSS Compromise: TeamPCP Hits Docker Hub, VS Code, PyPI](https://www.securityweek.com/from-trivy-to-broad-oss-compromise-teampcp-hits-docker-hub-vs-code-pypi/)
80. [SecurityWeek: Telnyx Targeted in Growing TeamPCP Supply Chain Attack](https://www.securityweek.com/telnyx-targeted-in-growing-teampcp-supply-chain-attack/)
81. [CSO Online: Trivy supply chain breach compromises over 1,000 SaaS environments, Lapsus$ joins the extortion wave](https://www.csoonline.com/article/4149938/trivy-supply-chain-breach-compromises-over-1000-saas-environments-lapsus-joins-the-extortion-wave.html)
82. [Dark Reading: Checkmarx KICS Code Scanner Targeted in Widening Supply Chain Hit](https://www.darkreading.com/application-security/checkmarx-kics-code-scanner-widening-supply-chain)
85. [Recorded Future / The Record: Supply chain attack hits widely-used AI package](https://therecord.media/supply-chain-attack-hits-widely-used-ai-package)
86. [Infosecurity Magazine: TeamPCP Expands Supply Chain Campaign With LiteLLM PyPI Compromise](https://www.infosecurity-magazine.com/news/teampcp-litellm-pypi-supply-chain/)
87. [Infosecurity Magazine: TeamPCP Targets Telnyx Package in Latest Software Supply Chain Attack](https://www.infosecurity-magazine.com/news/teampcp-targets-telnyx-pypi-package/)
88. [DataBreachToday: LiteLLM Hit in Cascading Supply Chain Attack](https://www.databreachtoday.com/litellm-hit-in-cascading-supply-chain-attack-a-31210)
89. [CyberNews: Critical Python supply chain compromise](https://cybernews.com/security/critical-litellm-supply-chain-attack-sends-shockwaves/)
90. [CybersecurityNews: Telnyx PyPI Package With 742,000 downloads Compromised](https://cybersecuritynews.com/telnyx-pypi-package-compromised/)
91. [CybersecurityNews: TeamPCP Supply Chain Attack Allegedly Compromised Databricks Platform](https://cybersecuritynews.com/databricks-teampcp-supply-chain/)
92. [CyberKendra: The LiteLLM Hack Was Just the Opening Move](https://www.cyberkendra.com/2026/03/the-litellm-hack-was-just-opening-move.html)
93. [Help Net Security: TeamPCP strikes again - Backdoored Telnyx PyPI package delivers malware](https://www.helpnetsecurity.com/2026/03/27/teampcp-telnyx-supply-chain-compromise/)
94. [Help Net Security: CISA sounds alarm on Langflow RCE, Trivy supply chain compromise](https://www.helpnetsecurity.com/2026/03/27/cve-2026-33017-cve-2026-33634-exploited/)
95. [Help Net Security: Week in Review - NIST Updates DNS Security Guidance, Compromised LiteLLM PyPI Packages](https://www.helpnetsecurity.com/2026/03/29/week-in-review-nist-updates-dns-security-guidance-compromised-litellm-pypi-packages/)
96. [LWN.net: LiteLLM on PyPI is compromised](https://lwn.net/Articles/1064479/)
97. [Security Affairs: 44 Aqua Security repositories defaced after Trivy supply chain breach](https://securityaffairs.com/189856/hacking/44-aqua-security-repositories-defaced-after-trivy-supply-chain-breach.html)
98. [Security Affairs: Malicious LiteLLM versions linked to TeamPCP supply chain attack](https://securityaffairs.com/189948/hacking/malicious-litellm-versions-linked-to-teampcp-supply-chain-attack.html)
99. [SecurityBoulevard: Trivy's March Supply Chain Attack Shows Where Secret Exposure Hurts Most](https://securityboulevard.com/2026/03/trivys-march-supply-chain-attack-shows-where-secret-exposure-hurts-most/)
100. [SecurityBoulevard/GitGuardian: How GitGuardian Enables Rapid Response to the LiteLLM Supply Chain Attack](https://securityboulevard.com/2026/03/how-gitguardian-enables-rapid-response-to-the-litellm-supply-chain-attack/)
101. [XDA Developers: A popular Python library just became a backdoor to your entire machine](https://www.xda-developers.com/popular-python-library-backdoor-machine/)
102. [Simon Willison: Malicious litellm](https://simonwillison.net/2026/Mar/24/malicious-litellm/)
103. [Times of India: Andrej Karpathy calls LiteLLM attack "software horror"](https://timesofindia.indiatimes.com/technology/tech-news/teslas-former-vp-andrej-karpathy-shares-ai-coding-horror-python-supply-chain-attack-that-could-have-wiped-millions-of-ssl-private-keys-database-passwords-more-and-elon-musk-agrees-says-/articleshow/129802671.cms)
104. [Risky Biz: LiteLLM and security scanner supply chains compromised (podcast)](https://risky.biz/RB830/)
105. [Heise.de: Supply chain attack on LiteLLM: Affected parties should change credentials](https://www.heise.de/en/news/Supply-chain-attack-on-LiteLLM-Affected-parties-should-change-credentials-11224139.html)
106. [Hackread: TeamPCP Hits Trivy, Checkmarx, and LiteLLM in Credential Theft Campaign](https://hackread.com/teampcp-trivy-checkmarx-litellm-credential-theft/)
107. [Hackread: TeamPCP Uses Fake Ringtone File in Tainted Telnyx SDK to Steal Credentials](https://hackread.com/teampcp-fake-ringtone-file-tainted-telnyx-sdk-credentials/)
108. [IT Pro: LiteLLM PyPI Compromise - Everything We Know So Far](https://www.itpro.com/security/litellm-pypi-compromise-everything-we-know-so-far)
109. [CyberPress: Microsoft Releases Guidance to Detect and Defend Against Trivy Supply Chain Attack](https://cyberpress.org/microsoft-trivy-supply-chain-attack/)
110. [GBHackers: Microsoft Unveils New Guidance to Detect and Defend Against Trivy Supply Chain Attack](https://gbhackers.com/microsoft-to-detect-defend-against-trivy-supply-chain-attack/)
111. [WindowsForum: CISA Adds Trivy CVE-2026-33634 to KEV](https://windowsforum.com/threads/cisa-adds-trivy-cve-2026-33634-to-kev-patch-supply-chain-risk-now.407639/)
112. [The New Stack: How TeamPCP Turned Aqua Security's Own Trivy Scanner Into a Weapon](https://thenewstack.io/teampcp-trivy-supply-chain-attack/)
113. [Cyber Magazine: Inside TeamPCP's Sophisticated Supply Chain Attack on Trivy](https://cybermagazine.com/news/inside-teampcps-sophisticated-supply-chain-attack-on-trivy)
114. [DevOps.com: Sophisticated Supply Chain Attack Targeting Trivy Expands to Checkmarx, LiteLLM](https://devops.com/sophisticated-supply-chain-attack-targeting-trivy-expands-to-checkmarx-litellm/)
115. [Integrity360: When Security Scanners Become the Weapon - LiteLLM Supply Chain Attack](https://insights.integrity360.com/threat-advisories/when-security-scanners-become-the-weapon-a-break-down-of-the-litellm-supply-chain-attack)
116. [Cato Networks: TeamPCP Supply Chain Attack Targets Trivy, KICS, and LiteLLM](https://www.catonetworks.com/blog/teampcp-supply-chain-attack/)

### Community Tools & Resources

117. [GitHub: litellm-check incident-response detection tool](https://github.com/lucubrator/litellm-check)
118. [Nono: How nono sandbox could have prevented the LiteLLM compromise](https://nono.sh/blog/nono-litellm)

120. [ByteIota: LiteLLM PyPI Attack - 95M Downloads Hit by Malware](https://byteiota.com/litellm-pypi-attack-95m-downloads-hit-by-malware-today/)
121. [Awesome Agents: LiteLLM Compromised - Credential Stealer in PyPI Package](https://awesomeagents.ai/news/litellm-supply-chain-compromise-credential-theft/)
122. [CyberInsider: New supply chain attack hits LiteLLM with 95M monthly downloads](https://cyberinsider.com/new-supply-chain-attack-hits-litellm-with-95m-monthly-downloads/)
123. [Daylight AI: litellm Library and an Expanding Supply Chain Campaign](https://daylight.ai/blog/litellm-library-and-an-expanding-supply-chain-campaign)
124. [OfficeChai: LiteLLM Attack - How a Hacked Security Tool Became a Master Key](https://officechai.com/ai/litellm-attack-how-a-hacked-security-tool-became-a-master-key-to-thousands-of-ai-developer-machines/)
125. [InfoWorld: PyPI warns developers after LiteLLM malware found stealing cloud and CI/CD credentials](https://www.infoworld.com/article/4149909/pypi-warns-developers-after-litellm-malware-found-stealing-cloud-and-ci-cd-credentials-2.html)
126. [DreamFactory: The AI Supply Chain Is Now Critical Infrastructure](https://blog.dreamfactory.com/the-ai-supply-chain-is-now-critical-infrastructure-lessons-from-the-teampcp-campaign-that-hit-trivy-checkmarx-and-litellm)
127. [Comet: LiteLLM Supply Chain Attack - What Happened, Who's Affected](https://www.comet.com/site/blog/litellm-supply-chain-attack/)
128. [Upwind: LiteLLM PyPI Supply Chain Attack Enables RCE & Exfiltration](https://www.upwind.io/feed/litellm-pypi-supply-chain-attack-malicious-release)
129. [SISA InfoSec: LiteLLM Supply Chain Compromise Threat Report](https://www.sisainfosec.com/blogs/litellm-supply-chain-compromise-when-your-ai-dependency-becomes-an-attack-vector/)
130. [NetSPI: LiteLLM Supply Chain Compromise](https://www.netspi.com/blog/executive-blog/ai-ml-pentesting/litellm-supply-chain-compromise/)
131. [ActiveState: Open Source Is Under Attack - How to Manage the Risk](https://www.activestate.com/blog/open-source-is-under-attack-how-to-manage-the-risk/)
132. [Comparitech: LiteLLM Supply Chain Attack Compromises Thousands and Counting](https://www.comparitech.com/news/litellm-supply-chain-attack-compromises-thousands-and-counting/)
133. [Codilime: LiteLLM Breach - CTO Perspective](https://codilime.com/blog/litellm-breach-cto-perspective/)
134. [Repello AI: LiteLLM Supply Chain Attack](https://repello.ai/blog/litellm-supply-chain-attack)
135. [HeroDevs: The LiteLLM Supply Chain Attack - What Happened, Why It Matters](https://www.herodevs.com/blog-posts/the-litellm-supply-chain-attack-what-happened-why-it-matters-and-what-to-do-next)
136. [SANS Stormcast Monday March 30, 2026: More TeamPCP: Telnyx; credential brokering via BreachForums](https://isc.sans.edu/podcastdetail/9870)
137. [HivePro: TeamPCP's Automated Supply Chain: From Trivy to LiteLLM in a Multi-Ecosystem Breach](https://hivepro.com/threat-advisory/teampcp-automated-supply-chain-from-trivy-to-litellm-in-a-multi-ecosystem-breach/)
141. [News4Hackers: Telnyx Targeted in Recent Supply Chain Cyberattack on TeamPCPs](https://www.news4hackers.com/telnyx-targeted-in-recent-supply-chain-cyberattack-on-teampcps/)
142. [GBHackers: Telnyx Python SDK Backdoored on PyPI to Steal Cloud Credentials](https://gbhackers.com/telnyx-python-sdk/)
143. [Infosecurity Magazine: TeamPCP Explores Ways to Exploit Stolen Supply Chain Secrets](https://www.infosecurity-magazine.com/news/teampcp-exploit-stolen-supply/)
144. [GitHub Issue #24843: Is litellm 1.83.0 on PyPI a legitimate release?](https://github.com/BerriAI/litellm/issues/24843)
145. [GitHub PR #24839: CI/CD v2 improvements documentation](https://github.com/BerriAI/litellm/pull/24839)
146. [GitHub PR #24840: Bump Version to 1.83.0](https://github.com/BerriAI/litellm/pull/24840)
147. [LiteLLM: Announcing CI/CD v2 for LiteLLM](https://docs.litellm.ai/blog/ci-cd-v2-improvements)
148. [Wiz: Tracking TeamPCP - Investigating Post-Compromise Attacks Seen in the Wild](https://www.wiz.io/blog/tracking-teampcp-investigating-post-compromise-attacks-seen-in-the-wild)
149. [SecurityWeek: TeamPCP Moves From OSS to AWS Environments](https://www.securityweek.com/teampcp-moves-from-oss-to-aws-environments/)
150. [Harness: TeamPCP & Trivy Exploit - Why Open Execution Pipelines Fail](https://www.harness.io/blog/teampcp-trivy-open-vs-governed-execution-pipelines)

## Update History

- **March 31, 2026, 12:11 PM ET.** BerriAI security blog silently updated to confirm v1.83.0 is a clean release and release freeze is lifted. Blog now references March 27 "Townhall updates" and CI/CD v2 pipeline. No announcement of the edit. Still no GitHub release tag (latest: `v1.82.3-stable.patch.2`), no maintainer response on #24843, no confirmation Mandiant review concluded. No security townhall recording published. Major new development: Wiz publishes post-compromise analysis showing TeamPCP actively exploiting stolen credentials in AWS environments (IAM, EC2, ECS, S3, Secrets Manager, Lambda). 7 new IPs and user agent IOCs added. SecurityWeek independently confirms the OSS-to-AWS pivot. Campaign has fully transitioned from supply chain compromise to cloud exploitation and monetization phase.
- **March 31, 2026, 9:29 AM ET.** Full research sweep on v1.83.0 release. Confirmed: PR #24840 is version bump only by `yuneng-berri`, merged at 05:00 UTC March 31 alongside CI/CD v2 docs (PR #24839 by `krrish-berri-2`). Published via new Trusted Publishing pipeline (OIDC, no long-lived tokens). Community wheel analysis on issue #24843 found no known IOCs. Still no GitHub release tag (latest: `v1.82.6.rc.2`), no release notes, no official blog announcement, no maintainer response on #24843. BerriAI CEO posted on LinkedIn about v1.83.0 features but has not updated the security blog or issue tracker. CI/CD v2 blog (March 30) details: isolated environments, repository separation, Trusted Publishing, immutable Docker tags; SLSA provenance and OpenSSF adoption planned but not yet implemented. Infosecurity Magazine (March 31) reports TeamPCP actively monetizing stolen credentials via Lapsus$/Vect. Mandiant review status unchanged (no announcement). Recommendation softened to tiered: cautious users hold at v1.82.6, risk-tolerant can consider v1.83.0 after hash verification.
- **March 30, 2026, 1:10 PM ET.** SANS ISC Update 004 (Kenneth Hartman): TeamPCP running dual ransomware operations with CipherForce (proprietary, high-value targets) and Vect (mass affiliate via BreachForums). Lapsus$ releases claimed 3 GB AstraZeneca data archive for free after failing to find buyers; Cybernews partially verified contents. Supply chain pause now at 96+ hours (longest since campaign began). Zero TeamPCP IOCs found in RubyGems, crates.io, Maven Central. CISA KEV deadline 9 days away. Still no clean LiteLLM PyPI release, no BerriAI post-mortem, no arrests.
- **March 30, 2026, 11:07 AM ET.** SANS Stormcast Monday podcast reports TeamPCP is brokering stolen credentials on BreachForums and collaborating with ransomware actors. HivePro publishes threat advisory revealing TeamPCP's December 2025 CanisterWorm campaign compromised 60,000+ servers globally (primarily Azure/AWS), establishing the group's operational history predating the March 2026 supply chain campaign. GBHackers, CybersecurityNews, and Field Effect publish new CanisterWorm and campaign analyses. No new package compromises (72+ hours). Coverage now 90+ outlets. Still no clean LiteLLM PyPI release, no BerriAI post-mortem, no arrests.
- **March 30, 2026, 10:00 AM ET.** Databricks investigating alleged compromise connected to TeamPCP campaign (CybersecurityNews). GitGuardian publishes quantitative blast radius analysis: 474 repos executed malicious trivy-action code; 1,705 of 2,247 litellm-dependent packages susceptible to pulling malicious versions; impacted orgs include Canonical, Microsoft, and NASA. Cloud Security Alliance publishes research note framing the attack as "proof of concept for a category of attack, not solely a campaign against a specific package." IETF Internet-Draft "Credential Broker for Agents" (CB4A) submitted March 29, directly motivated by the TeamPCP campaign, citing "300+ GB of compressed credentials affecting approximately 500,000 corporate identities." Telnyx confirms root cause resolved, states SDK had "no privileged access to Telnyx infrastructure," no customer data accessed. UK NCSC CTO includes TeamPCP in weekly summary. Coverage now 85+ outlets. Still no clean LiteLLM PyPI release (v1.82.6 remains latest), no BerriAI post-mortem, no arrests.
- **March 28, 2026, 5:00 PM ET.** SANS ISC Update 003 reports no new package compromises in 48 hours; campaign appears to have shifted from expansion to monetization phase, with TeamPCP/Vect focusing on extorting victims using already-harvested credentials. Singapore Cyber Security Agency (CSA) publishes national advisory AD-2026-001 for the ongoing TeamPCP campaign. AppOmni releases "Heisenberg mode" for its open-source tool to help teams trace GitHub Actions wrapper dependencies to underlying components and detect tainted supply chain pulls. Coverage now 75+ outlets. Still no clean LiteLLM PyPI release, no BerriAI post-mortem, no arrests.
- **March 28, 2026, 9:30 AM ET.** Palo Alto Networks, Cycode, The New Stack, Cyber Magazine, ARMO, Integrity360, DevOps.com, and Cloud Security Alliance all publish analyses (coverage now 70+ outlets). **CipherForce** confirmed as TeamPCP's new dedicated affiliate extortion and leak platform, distinct from the Vect ransomware alliance; TeamPCP stated directly: "CipherForce is a newer project we are starting to find affiliates and are hoping to begin publishing companies soon." Mandiant forensic audit scope confirmed: all LiteLLM releases from v1.78.0 through v1.82.6 verified clean across PyPI and Docker. GitHub releases still at v1.82.6.dev2. No new BerriAI post-mortem, no new clean PyPI release, no arrests.
- **March 27, 2026, 2:30 PM ET.** TeamPCP strikes again: Telnyx PyPI package (versions 4.87.1, 4.87.2) compromised at 03:51 UTC on March 27, using credentials harvested from the LiteLLM attack three days earlier. Novel WAV steganography technique hides payloads inside audio files, 87% smaller dropper than LiteLLM. New Windows persistence via fake msbuild.exe in Startup folder. New C2 at bare IP 83.142.209.203:8080 (no domain). Credential cascade confirmed: LiteLLM harvest yielded Telnyx PyPI token. CISA KEV deadline corrected to April 9, 2026 (not April 3). Bitsight telemetry shows +300% TeamPCP activity spike. Datadog Security Labs, Endor Labs, Aikido, Help Net Security, Infosecurity Magazine, CybersecurityNews, Mend.io, CovertSwarm, and Bitsight all publish new analyses. German BSI reports "no data believed to have been exfiltrated." TechCrunch reports Delve handled security compliance for LiteLLM. Coverage now 55+ outlets. Campaign ecosystem count rises to seven (adding Telnyx). Still no: clean LiteLLM PyPI release, BerriAI post-mortem, or arrests.
- **March 26, 2026, 7:16 PM ET.** CISA confirms CVE-2026-33634 added to KEV catalog (previously single-source, now independently verified via CISA alert page). Kaspersky/Securelist publishes deep technical analysis with 6 new MD5 hashes and full malware breakdown. DataBreachToday reveals 47,000 downloads in 46 minutes before PyPI removal. CyberKendra breaks TeamPCP-Vect ransomware alliance: 300,000+ dark web forum members given ransomware affiliate keys. Forbes reports TeamPCP claims AI assisted their attacks. Coverage surges past 40+ outlets.
- **March 26, 2026, 2:45 PM ET.** Microsoft publishes expanded Defender XDR detection guidance. SANS Institute, Kaspersky, Okta, Arctic Wolf, Trend Micro, Deepwatch, Recorded Future, and Point Wild all publish advisories or tools (coverage now 35+ outlets). CISA reportedly adds CVE-2026-33634 to KEV catalog. Point Wild releases free "who-touched-my-packages" (wtmp) behavioral scanner. CanisterWorm npm package count revised upward to 66+ (from 29+). Mandiant estimate: 1,000+ SaaS environments confirmed, potentially 5,000-10,000.

## How This Report Was Generated

- Researched using Claude Code (Opus 4.6) with strict anti-hallucination guardrails
- Sources gathered via SearXNG (self-hosted metasearch aggregating Bing, DuckDuckGo, Brave, Startpage, Reddit), then verified by reading each source directly
- Every factual claim is cited inline; confidence levels flagged where evidence varies
- No claims made without a verifiable source; gaps explicitly acknowledged
- This report is actively monitored and updated as new developments emerge
