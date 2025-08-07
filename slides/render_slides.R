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
  "00-intro.qmd",
  "01-causal_modeling_whole_game.qmd",
  "02-when-standard-methods-succeed.qmd",
  "03-causal-inference-with-group-by-and-summarise.qmd",
  "04-dags.qmd",
  "05-quartets.qmd",
  "06-pscores.qmd",
  "07-using-pscores.qmd",
  "08-pscore-diagnostics.qmd",
  "09-outcome-model.qmd",
  "10-continuous-g-comp.qmd",
  "11-tipr.qmd",
  "12-whole_game-2.qmd",
  "13-bonus-selection-bias.qmd",
  "14-bonus-continuous-pscores.qmd",
  "15-bonus-ml-for-causal.qmd"
)

purrr::walk(slides, render_slides)
