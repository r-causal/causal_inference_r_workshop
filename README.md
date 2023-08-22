
<!-- README.md is generated from README.Rmd. Please edit that file -->

## Causal Inference in R Workshop

### Slides

- [00
  Intro](https://causal-inference-r-workshop.netlify.app/00-intro.html)
- [01 Whole
  Game](https://causal-inference-r-workshop.netlify.app/01-causal_modeling_whole_game.html)
- [02 When Standard Methods
  Succeed](https://causal-inference-r-workshop.netlify.app/02-when-standard-methods-succeed.html)
- [03 Causal Inference with `group_by` and
  `summarise`](https://causal-inference-r-workshop.netlify.app/03-causal-inference-with-group-by-and-summarise.html)
- [04 Causal
  Diagrams](https://causal-inference-r-workshop.netlify.app/04-dags.html)
- [05 Causal Inference is Not Just a Statistics
  Problem](https://causal-inference-r-workshop.netlify.app/05-quartets.html)
- [06 Introduction to Propensity
  Scores](https://causal-inference-r-workshop.netlify.app/06-pscores.html)
- [07 Using Propensity
  Scores](https://causal-inference-r-workshop.netlify.app/07-using-pscores.html)
- [08 Checking Propensity
  Scores](https://causal-inference-r-workshop.netlify.app/08-pscore-diagnostics.html)
- [09 Fitting the outcome
  model](https://causal-inference-r-workshop.netlify.app/09-outcome-model.html)
- [10 Continuous
  Exposures](https://causal-inference-r-workshop.netlify.app/10-continuous-exposures.html)
- [11 Tipping Point Sensitivity
  Analyses](https://causal-inference-r-workshop.netlify.app/11-tipr.html)
- [12 Whole Game (Your
  Turn)](https://causal-inference-r-workshop.netlify.app/12-whole_game-2.html)
- [13 Bonus: Selection
  Bias](https://causal-inference-r-workshop.netlify.app/13-bonus-selection-bias.html)

### Installing materials locally

We will be using Posit Cloud for the workshop, but if you would like to
install the required packages and course materials, we have an R package
called
{[causalworkshop](https://github.com/malcolmbarrett/causalworkshop)} to
help you do that! You can install
{[causalworkshop](https://github.com/malcolmbarrett/causalworkshop)}
from GitHub with:

``` r
install.packages("remotes")
remotes::install_github("malcolmbarrett/causalworkshop")
```

Once you’ve installed the package, install the workshop with

``` r
causalworkshop::install_workshop()
```

By default, this package downloads the materials to a conspicuous place
like your Desktop. You can also tell `install_workshop()` exactly where
to put the materials:

``` r
causalworkshop::install_workshop("a/path/on/your/computer")
```
