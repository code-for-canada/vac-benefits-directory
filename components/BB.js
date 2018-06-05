import React, { Component } from "react";
import PropTypes from "prop-types";
import { Grid, Button } from "material-ui";
import classnames from "classnames";
import { withStyles } from "material-ui/styles";
import Typography from "material-ui/Typography";
import { InputLabel } from "material-ui/Input";
import { MenuItem } from "material-ui/Menu";
import { FormControl } from "material-ui/Form";
import Select from "material-ui/Select";

import "babel-polyfill/dist/polyfill";

import BenefitCard from "../components/benefit_cards";
import RadioSelector from "../components/radio_selector";
import NeedsSelector from "./needs_selector";

const styles = theme => ({
  benefitsCount: {
    fontSize: "24px",
    marginTop: "-10px",
    textAlign: "center"
  },
  collapse: {
    textAlign: "right",
    textDecoration: "underline"
  },
  filterBox: {
    border: "1px solid #eee",
    padding: "20px !important"
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  },
  sortBy: {
    textAlign: "right"
  },
  subTitle: {
    fontSize: "20px",
    fontWeight: "100",
    paddingBottom: "25px"
  },
  title: {
    fontSize: "36px",
    padding: "15px 0"
  }
});

export class BB extends Component {
  state = {
    sortByValue: "relevance"
  };
  children = [];

  collapseAllBenefits = () => {
    this.children.forEach(c => {
      c.setState({ open: false });
      c.children.forEach(cc => {
        cc.setState({ open: false });
      });
    });
  };

  eligibilityMatch = (path, selected) => {
    let matches = true;
    ["serviceType", "patronType", "statusAndVitals"].forEach(criteria => {
      if (
        selected[criteria] != "" &&
        path[criteria] !== "na" &&
        selected[criteria] != path[criteria]
      ) {
        matches = false;
      }
    });
    return matches;
  };

  filteredBenefits = (
    benefits,
    eligibilityPaths,
    selectedEligibility,
    needs,
    selectedNeeds
  ) => {
    if (benefits.length === 0) {
      return benefits;
    }

    // find benefits that match
    let benefitIdsForProfile = [];
    eligibilityPaths.forEach(ep => {
      if (this.eligibilityMatch(ep, selectedEligibility)) {
        benefitIdsForProfile = benefitIdsForProfile.concat(ep.benefits);
      }
    });
    let benefitIdsForSelectedNeeds = [];
    if (Object.keys(selectedNeeds).length > 0) {
      Object.keys(selectedNeeds).forEach(id => {
        const need = needs.filter(n => n.id === id)[0];
        benefitIdsForSelectedNeeds = benefitIdsForSelectedNeeds.concat(
          need.benefits
        );
      });
    } else {
      benefitIdsForSelectedNeeds = benefits.map(b => b.id);
    }
    let matchingBenefitIds = benefitIdsForProfile.filter(
      id => benefitIdsForSelectedNeeds.indexOf(id) > -1
    );

    // find benefits with matching children
    const benefitIdsWithMatchingChildren = benefits
      .filter(
        b =>
          b.childBenefits &&
          b.childBenefits.filter(cbID => matchingBenefitIds.indexOf(cbID) > -1)
            .length > 0
      )
      .map(b => b.id);

    const benefitIDsToShow = matchingBenefitIds.concat(
      benefitIdsWithMatchingChildren
    );
    let benefitsToShow = benefits.filter(
      b => benefitIDsToShow.indexOf(b.id) > -1
    );

    // if a benefit is already shown as a child, only show it (as a parent card) if it's available independently
    let childrenIDsShown = [];
    benefitsToShow.forEach(b => {
      childrenIDsShown = childrenIDsShown.concat(b.childBenefits);
    });
    benefitsToShow = benefitsToShow.filter(
      b =>
        b.availableIndependently === "Independent" ||
        childrenIDsShown.indexOf(b.id) < 0
    );

    return benefitsToShow;
  };

  sortBenefits = (filteredBenefits, language) => {
    filteredBenefits.forEach(b => {
      if (b.sortingPriority === undefined) {
        b.sortingPriority = "low";
      }
      b.sortingNumber = { high: 1, medium: 2, low: 3 }[b.sortingPriority];
    });

    let sorting_fn = (a, b) => {
      if (
        this.state.sortByValue === "alphabetical" ||
        a.sortingNumber === b.sortingNumber
      ) {
        // sort alphabetically
        let vacName = language === "en" ? "vacNameEn" : "vacNameFr";
        let nameA = a[vacName].toUpperCase();
        let nameB = b[vacName].toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      }
      // ascending numeric sort
      return a.sortingNumber - b.sortingNumber;
    };
    return filteredBenefits.sort(sorting_fn);
  };

  handleSortByChange = event => {
    this.setState({ sortByValue: event.target.value });
  };

  countString = (x, t) => {
    switch (x) {
      case 0:
        return t("B3.No benefits");
      case 1:
        return t("B3.One benefit");
      default:
        return t("B3.x benefits to consider", { x: x });
    }
  };

  render() {
    let serviceTypes = Array.from(
      new Set(this.props.eligibilityPaths.map(ep => ep.serviceType))
    )
      .filter(st => st !== "na")
      .map(st => {
        return { id: st, name_en: st, name_fr: "FF " + st };
      });

    const patronTypes = Array.from(
      new Set(this.props.eligibilityPaths.map(ep => ep.patronType))
    )
      .filter(st => st !== "na")
      .map(st => {
        return { id: st, name_en: st, name_fr: "FF " + st };
      });

    let statusAndVitals = Array.from(
      new Set(this.props.eligibilityPaths.map(ep => ep.statusAndVitals))
    )
      .filter(st => st !== "na")
      // .concat(["still serving"])
      .map(st => {
        return { id: st, name_en: st, name_fr: "FF " + st };
      });

    const { t, classes } = this.props; // eslint-disable-line no-unused-vars
    this.sortBenefits(
      this.props.benefits,
      this.props.t("current-language-code")
    );
    const filteredBenefits = this.filteredBenefits(
      this.props.benefits,
      this.props.eligibilityPaths,
      this.props.selectedEligibility,
      this.props.needs,
      this.props.selectedNeeds
    );

    return (
      <div id={this.props.id}>
        <div style={{ padding: 12 }}>
          <Grid container spacing={24}>
            <Grid item xs={12}>
              <Typography className={classes.title}>{t("B3.title")}</Typography>
              <Typography className={classes.subTitle}>
                {t("B3.subtitle")}
              </Typography>
            </Grid>
            <Grid item md={3} sm={5} xs={12} className={classes.filterBox}>
              <Grid container spacing={8}>
                <Grid item xs={12}>
                  <Typography variant="title">
                    {t("B3.Filter Benefits")}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <RadioSelector
                    id="patronTypeFilter"
                    t={t}
                    legend={t("B3.Benefits for")}
                    filters={patronTypes}
                    selectedFilters={this.props.selectedEligibility.patronType}
                    setUserProfile={id =>
                      this.props.setUserProfile("patronType", id)
                    }
                    isDisabled={false}
                  />
                </Grid>

                <Grid item xs={12}>
                  <RadioSelector
                    id="serviceTypeFilter"
                    t={t}
                    legend={t("B3.ServiceType")}
                    filters={serviceTypes}
                    selectedFilters={this.props.selectedEligibility.serviceType}
                    setUserProfile={id =>
                      this.props.setUserProfile("serviceType", id)
                    }
                    isDisabled={false}
                  />
                </Grid>

                <Grid item xs={12}>
                  <RadioSelector
                    id="statusAndVitalsFilter"
                    t={t}
                    legend={t("B3.serviceStatus")}
                    filters={statusAndVitals}
                    selectedFilters={
                      this.props.selectedEligibility.statusAndVitals
                    }
                    setUserProfile={id =>
                      this.props.setUserProfile("statusAndVitals", id)
                    }
                    isDisabled={false}
                  />
                </Grid>
                <br />

                <Grid item xs={12}>
                  <NeedsSelector
                    t={t}
                    needs={this.props.needs}
                    selectedNeeds={this.props.selectedNeeds}
                    handleChange={this.props.setSelectedNeeds}
                  />
                </Grid>

                <Grid item xs={12}>
                  <br /> <br />
                  <Button
                    id="ClearFilters"
                    variant="raised"
                    onClick={() => {
                      this.props.clearFilters();
                    }}
                  >
                    {t("Show All Benefits")}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item md={9} sm={7} xs={12}>
              <Grid item xs={12}>
                <Typography
                  className={"BenefitsCounter " + classes.benefitsCount}
                >
                  {this.countString(filteredBenefits.length, t)}
                </Typography>
                {filteredBenefits.length > 0 ? (
                  <p
                    style={{
                      fontWeight: "100",
                      margin: "5px",
                      textAlign: "center"
                    }}
                  >
                    {t("B3.check eligibility")}
                  </p>
                ) : (
                  ""
                )}
              </Grid>

              <Grid container spacing={24}>
                <Grid item xs={12} className={classnames(classes.sortBy)}>
                  <FormControl
                    id="sortBySelector"
                    className={classes.formControl}
                  >
                    <InputLabel>{t("B3.Sort By")}</InputLabel>
                    <Select
                      value={this.state.sortByValue}
                      onChange={this.handleSortByChange}
                    >
                      <MenuItem value={"relevance"}>
                        {t("B3.Relevance")}
                      </MenuItem>
                      <MenuItem value={"alphabetical"}>
                        {t("B3.Alphabetical")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} className={classnames(classes.collapse)}>
                  <Button
                    id="CollapseBenefits"
                    variant="flat"
                    size="small"
                    onClick={this.collapseAllBenefits}
                  >
                    {t("Close all")}
                  </Button>
                </Grid>
                {filteredBenefits.map(
                  (benefit, i) =>
                    true || benefit.availableIndependently === "Independant" ? ( // eslint-disable-line no-constant-condition
                      <BenefitCard
                        id={"bc" + i}
                        className="BenefitCards"
                        benefit={benefit}
                        examples={this.props.examples}
                        allBenefits={this.props.benefits}
                        t={this.props.t}
                        key={benefit.id}
                        onRef={ref => this.children.push(ref)}
                      />
                    ) : (
                      ""
                    )
                )}
              </Grid>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}

BB.propTypes = {
  benefits: PropTypes.array,
  classes: PropTypes.object,
  clearFilters: PropTypes.func,
  eligibilityPaths: PropTypes.array,
  examples: PropTypes.array,
  id: PropTypes.string,
  needs: PropTypes.array,
  selectedEligibility: PropTypes.object,
  selectedNeeds: PropTypes.object,
  setSelectedNeeds: PropTypes.func,
  setUserProfile: PropTypes.func,
  t: PropTypes.func,
  toggleSelectedEligibility: PropTypes.func
};

export default withStyles(styles)(BB);
