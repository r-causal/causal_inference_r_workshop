library(survey)
library(tableone)
library(tidyverse)
library(broom)
# remotes::install_github("malcolmbarrett/cidata")
library(cidata)

propensity_model <- glm(
  qsmk ~ sex + 
    race + age + I(age^2) + education + 
    smokeintensity + I(smokeintensity^2) + 
    smokeyrs + I(smokeyrs^2) + exercise + active + 
    wt71 + I(wt71^2), 
  family = binomial(), 
  data = nhefs_complete
)

df <- propensity_model %>% 
  augment(type.predict = "response", data = nhefs_complete) %>% 
  mutate(wts = 1 / ifelse(qsmk == 0, 1 - .fitted, .fitted))

svy_des <- svydesign(
  ids = ~ 1,
  data = df,
  weights = ~ wts)

smd_table_unweighted <- CreateTableOne(
  vars = c("sex", "race", "age", "education", "smokeintensity", "smokeyrs", 
           "exercise", "active", "wt71"),
  strata = "qsmk",
  data = df,
  test = FALSE)

smd_table <- svyCreateTableOne(
  vars = c("sex", "race", "age", "education", "smokeintensity", "smokeyrs", 
           "exercise", "active", "wt71"),
  strata = "qsmk",
  data = svy_des,
  test = FALSE)


plot_df <- data.frame(
  var = rownames(ExtractSmd(smd_table)),                        
  Unadjusted = as.numeric(ExtractSmd(smd_table_unweighted)),                      
  Weighted = as.numeric(ExtractSmd(smd_table))) %>%
  pivot_longer(-var, names_to = "Method", values_to = "SMD")

ggplot(
  data = plot_df,
  mapping = aes(x = var, y = SMD, group = Method, color = Method)
) +
  geom_line() +
  geom_point() + 
  geom_hline(yintercept = 0.1, color = "black", size = 0.1) +  
  coord_flip()
