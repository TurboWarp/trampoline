# trampoline

**Note: Due to a long history of abuse, the code that is deployed the production version of trampoline that we host diverges substantially from what is public here.** It includes tweaks around abuse detection, fairness, and prioritization. Please note for this repository, our [bug bounty program](https://github.com/TurboWarp/.github/security/policy) only covers the production version of this repository, not the open source code here. Sorry. We hope to publish more of that soon.

Purpose-built proxy and cache for the Scratch API. It is used by [forkphorus](https://forkphorus.github.io) and [TurboWarp](https://turbowarp.org). It only implements a few routes that these sites need -- it is not a general-purpose proxy. There is no guarantee of compatibility. It uses very heavy caching to reduce the amount of requests sent to the upstream Scratch API.

The app assumes it's behind a reverse proxy such as nginx.

An instance of this service is hosted at https://trampoline.turbowarp.org/
