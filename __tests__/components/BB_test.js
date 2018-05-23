/* eslint-env jest */

import { mount, shallow } from "enzyme";
import React from "react";

import { BB } from "../../components/BB";
import benefitsFixture from "../fixtures/benefits";
import elegibilityPathsFixture from "../fixtures/eligibilityPaths";
import needsFixture from "../fixtures/needs";

jest.mock("react-ga");

describe("BB", () => {
  let props;
  let _mountedBB;
  let _shallowBB;

  const mounted_BB = () => {
    if (!_mountedBB) {
      _mountedBB = mount(<BB {...props} />);
    }
    return _mountedBB;
  };

  const shallow_BB = () => {
    if (!_shallowBB) {
      _shallowBB = shallow(<BB {...props} />);
    }
    return _shallowBB;
  };

  beforeEach(() => {
    props = {
      t: key => key,
      benefits: benefitsFixture,
      eligibilityPaths: elegibilityPathsFixture,
      selectedNeeds: {},
      needs: [],
      selectedEligibility: {
        serviceType: { CAF: 1 },
        serviceStatus: { released: 1 },
        patronType: { ["service-person"]: 1 },
        servicePersonVitalStatus: { alive: 1 }
      },
      toggleSelectedEligibility: jest.fn(),
      classes: {
        card: "BB-card-87",
        media: "BB-media-88",
        actions: "BB-actions-89",
        expand: "BB-expand-90",
        expandOpen: "BB-expandOpen-91",
        avatar: "BB-avatar-92"
      }
    };
    _shallowBB = undefined;
  });

  it("has a correct filteredBenefits function", () => {
    let BBInstance = shallow_BB().instance();
    expect(
      BBInstance.filteredBenefits(
        benefitsFixture,
        elegibilityPathsFixture,
        props.selectedEligibility,
        needsFixture,
        props.selectedNeeds
      )
    ).toEqual([benefitsFixture[0]]);
  });

  it("has a serviceTypes filter", () => {
    expect(shallow_BB().find("#serviceTypeFilter").length).toEqual(1);
  });
  it("has a patronType filter", () => {
    expect(shallow_BB().find("#patronTypeFilter").length).toEqual(1);
  });

  it("has the filters contained in a collapse component", () => {
    expect(
      shallow_BB()
        .find("#collapseBlock")
        .find("#serviceTypeFilter").length
    ).toEqual(1);
    expect(
      shallow_BB()
        .find("#collapseBlock")
        .find("#patronTypeFilter").length
    ).toEqual(1);
  });

  it("has the filter initially expanded", () => {
    expect(shallow_BB().state().expanded).toEqual(true);
  });

  it("has a button to collapse / expand the filter", () => {
    shallow_BB()
      .find("#expandButton")
      .simulate("click");
    expect(shallow_BB().state().expanded).toEqual(false);
    shallow_BB()
      .find("#expandButton")
      .simulate("click");
    expect(shallow_BB().state().expanded).toEqual(true);
  });

  it("has the selected benefit cards", () => {
    const benefitCards = shallow_BB().find(".BenefitCards");
    expect(benefitCards.length).toEqual(1);
    benefitCards.map((bt, i) => {
      expect(bt.prop("benefit").vac_name_fr).toEqual(
        benefitsFixture[i].vac_name_fr
      );
    });
  });

  it("allows a person to click on filters", () => {
    let filter = mounted_BB()
      .find("FilterSelector")
      .first();
    let checkbox = filter.find("Checkbox").first();
    checkbox.simulate("change");
    expect(props.toggleSelectedEligibility).toBeCalled();
  });

  it("has an All Benefits Link", () => {
    expect(
      shallow_BB()
        .find(".AllBenefits")
        .text()
    ).toEqual("Show All Benefits");
  });
});