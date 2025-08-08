render_slides <- function(.qmd_file) {
  usethis::ui_done("Rendering {usethis::ui_path(.qmd_file)}")
  render_quietly(.qmd_file)
}

render_quietly <- function(.qmd_file) {
  pdf_file <- fs::path(
    "slides",
    "pdf",
    fs::path_ext_set(fs::path_file(.qmd_file), "pdf")
  )

  html_file <- normalizePath(path_ext_set(.qmd_file, ".html"))

  suppress(quarto::quarto_render(.qmd_file, quiet = TRUE))
  suppress(renderthis::to_pdf(html_file, pdf_file))
}

suppress <- function(code) {
  suppressMessages(
    suppressWarnings(
      suppressPackageStartupMessages(
        code
      )
    )
  )
}

slides <- c(
  "slides/raw/01-causal_modeling_whole_game.qmd",
  "slides/raw/00-intro.qmd",
  "slides/raw/02-when-standard-methods-succeed.qmd",
  "slides/raw/03-causal-inference-with-group-by-and-summarise.qmd",
  "slides/raw/04-dags.qmd",
  "slides/raw/05-quartets.qmd",
  "slides/raw/06-pscores.qmd",
  "slides/raw/07-using-pscores.qmd",
  "slides/raw/08-pscore-diagnostics.qmd",
  "slides/raw/09-outcome-model.qmd",
  "slides/raw/10-continuous-g-comp.qmd",
  "slides/raw/11-tipr.qmd",
  "slides/raw/12-whole_game-2.qmd",
  "slides/raw/13-bonus-selection-bias.qmd",
  "slides/raw/14-bonus-continuous-pscores.qmd",
  "slides/raw/15-bonus-ml-for-causal.qmd"
)

purrr::walk(slides, render_slides)
