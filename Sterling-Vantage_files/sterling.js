var resortCircularList = [],
    resortDataArray = [],
    resortPlans = [],
    selectedCircularRatePlan = void 0,
    hsdCircularMaxChildCount = 2,
    selectedResortName = "",
    selectedPromoOfferCode = "",
    isOfferAvaild = !1;
$(document).ready(function () {
    setDatePickers();
    clearBkRelatedSessionData();
    $(".check-availability").removeAttr("disabled");
    getDestination(!1);
    $("#bookingOffersDiv").hide();
    url = "/bin/nodeutil.content__sterlingholidays__en__index__main-authoring-dialog__jcr-content__par__author_dialog.property__uierrorconfig.property__rateplantype.property__addErrorConfig.json";
    getData(url, parseAuthorContent);
    $("#resortCircularList").sortable({
        axis: "y",
        "ui-floating": !1,
        cursor: "move",
        handle: ".handle",
        update: function (a, c) {
            var b = $("#resortCircularList").sortable("toArray");
            a = [];
            for (var e = 0; e < b.length; e++)
                console.log("Position: " + e + " ID: " + b[e].replace("circularResort-", "").trim()),
                    (c = resortCircularList.filter(function (a) {
                        return a.resortId.trim() == b[e].replace("circularResort-", "").trim();
                    })) &&
                        0 < c.length &&
                        a.push(c[0]);
            resortCircularList = a;
            remapCircularResort();
        },
    });
    $(document).on("click", "#bookNowNrml,#bookNowSticky", function () {
        clearAuthenticationForm();
    });
    $("#removePromo").on("click", function () {
        removePromo();
    });
    $(document).on("click", ".tt-selectable", function () {
        validateBooking(!1);
    });
    if (getSessionData("destinationPromo")) {
        var a = getSessionData("destinationPromo");
        a && (applyPromoForResortBooking("", a), deleteSession("destinationPromo"));
    }
});
function getDestination(a) {
    $(".isPackageFlow-6-8").removeClass("col-lg-8 col-lg-6");
    $(".isPackageFlow-6-4").removeClass("col-lg-4 col-lg-6");
    $(".isPackageFlow-4-11").removeClass("col-lg-4 col-lg-11");
    a
        ? ($(".multi-book").hide(),
          $(".corporateBooking").show(),
          $(".isPackageFlow-6-8").addClass("col-lg-8"),
          $(".isPackageFlow-6-4").addClass("col-lg-4"),
          $(".isPackageFlow-4-11").addClass("col-lg-11"),
          $("#isCorporate").prop("checked", !0))
        : ($(".multi-book").show(),
          $("#single-city").prop("checked", !0),
          $(".corporateBooking").hide(),
          $("#isCorporate").prop("checked", !1),
          $(".isPackageFlow-6-8").addClass("col-lg-8"),
          $(".isPackageFlow-6-4").addClass("col-lg-4"),
          $(".isPackageFlow-4-11").addClass("col-lg-11"));
    $("#bookingOffersDiv").show();
    url = "/bin/nodeutil.content__sterlingholidays__en__index__resorts-hotels.p__masterName.p__resortID.p__locationLatitude.p__locationLongitude.p__byregions.p__sfResortID.p__roomInfo.p__resortAmenitiesList.p__address.json";
    getData(url, getResortData);
    $("#bookingOffersDiv").hide();
    getAdminData();
    setCircularRatePlan();
    clearHSDData();
}
function clearHSDData() {
    var a = getSessionData("resortName");
    a ? ($("#singleDestination .typeahead").typeahead("val", a), $("#singleDestination .typeahead").trigger("typeahead:selected", { value: a }), $("#singleDestination").val(a), deleteSession("resortName")) : $("#singleDestination").val("");
    $("#hsdCheckInDate").val("");
    $("#hsdCheckOutDate").val("");
    $("#corporateCode").val("");
    $("#hsdCircularCheckInDate").val("");
    $("#hsdCircularTotalAdultcount").val("1");
    $("#hsdCircularTotalChildcount").val("0");
    resortCircularList = [];
}
function getAdminData(a) {
    void 0 == a
        ? ((url = "/bin/nodeutil.content__sterlingholidays__adminsetting__admin.property__content.json"), getData(url, getAdminData))
        : ((a = JSON.parse(a.responseText)), (ADMINDATA = JSON.parse(a.content)), $("#maxRoomsAllowed").html("Booking more than " + ADMINDATA.maxRoomsToBeBooked + " rooms?"));
}
function validateBooking(a) {
    if ($("#hsdCheckInDate").val() && $("#hsdCheckOutDate").val() && $("#singleDestination").val()) {
        if ($("#isCorporate").prop("checked")) {
            if ($("#corporateCode").val()) return $(".check-availability").enableButton(), !0;
            $(".check-availability").disableButton();
            return !1;
        }
        $(".check-availability").removeAttr("disabled");
        a = $.datepicker.formatDate("mm/dd/yy", new Date($("#hsdCheckInDate").val()));
        var b = $.datepicker.formatDate("mm/dd/yy", new Date($("#hsdCheckOutDate").val()));
        offersAtTheResortInBookNow(a, b);
        return !0;
    }
    $(".check-availability").disableButton();
    $("#singleDestination").val() && ((a = $.datepicker.formatDate("mm/dd/yy", new Date())), (b = $.datepicker.formatDate("mm/dd/yy", new Date())), offersAtTheResortInBookNow(a, b));
    return !1;
}
function validateBookingDates() {
    var a = $("#hsdCheckInDate").val(),
        b = $("#hsdCheckOutDate").val();
    if (a && b) {
        b = new Date(b);
        a = new Date(a);
        a.getDate();
        a = Math.round((b - a) / 1e3 / 60 / 60 / 24);
        if (!isNaN(ADMINDATA.maxDaysToBeBooked) && a > Number(ADMINDATA.maxDaysToBeBooked))
            return $("#bookingDateError").show(), $(".days-exceed-alert").show(), $("#bookingDateError").html("Booking allowed only for " + ADMINDATA.maxDaysToBeBooked + " nights"), $("#chkAvb").attr("disabled", !0), !1;
        $("#bookingDateError").hide();
        $(".days-exceed-alert").hide();
        return !0;
    }
}
function setDatePickers() {
    $("#corporateCode,#singleDestination,#hsdCheckInDate,#hsdCheckOutDate").focusout(function () {
        validateBooking(!1);
    });
    $(document).on("change", ".validateValue", function () {
        validateBooking(!1);
    });
    $("#hsdCheckInDate").val("");
    $("#hsdCheckOutDate").val("");
    $("#singleDestination").val("");
    $("#corporateCode").val("");
    $("#corporateCodeError").html("");
    $(".check-availability").disableButton();
    $("#hsdCheckInDate,#hsdCheckOutDate").datepicker("remove");
    $("#hsdCheckInDate,#hsdCheckOutDate")
        .datepicker({
            container: "#picker-container",
            startDate: moment().toDate(),
            endDate: moment().add(120, "days").toDate(),
            toggleActive: !1,
            todayBtn: !1,
            keepEmptyValues: !0,
            todayHighlight: !0,
            autoApply: !0,
            autoclose: !0,
            orientation: "top",
            format: "M d, yyyy",
        })
        .on("changeDate", function (a) {
            var b = $("#hsdCheckInDate").val();
            $("#hsdCheckOutDate").val();
            "hsdCheckInDate" == a.target.id
                ? ((a = new Date(b)),
                  a.setDate(a.getDate() + 1),
                  $("#hsdCheckInDate").datepicker("hide"),
                  $("#hsdCheckOutDate").datepicker("setStartDate", a),
                  $("#hsdCheckOutDate").datepicker("show"),
                  $("#hsdCheckOutDate").val($.datepicker.formatDate("M d, yy", a)),
                  validateBooking(!1),
                  latestOffersForCheckInDate())
                : "hsdCheckOutDate" == a.target.id && ($("#hsdCheckOutDate").datepicker("hide"), validateBooking(!1), latestOffersForCheckOutDate());
        });
    $("#hsdCircularCheckInDate")
        .datepicker({
            container: "#picker-container",
            startDate: moment().toDate(),
            endDate: moment().add(120, "days").toDate(),
            toggleActive: !1,
            todayBtn: !1,
            keepEmptyValues: !0,
            defaultDate: new Date(),
            todayHighlight: !0,
            autoApply: !1,
            orientation: "top",
            format: "M d, yyyy",
            autoclose: !0,
        })
        .on("changeDate", function (a) {
            "hsdCircularCheckInDate" == a.target.id && updateCircularResort();
        });
    $(".check-availability").unbind("click");
    $(".check-availability").click(function () {
        if (isOfferAvaild && getSessionData("offerMinDate")) {
            var a = Number(getSessionData("offerMinDate")),
                b = moment($("#hsdCheckInDate").val()),
                c = moment($("#hsdCheckOutDate").val());
            if (c.diff(b, "days") < a) return $(".days-exceed-alert").show(), $("#bookingDateError").show(), $("#bookingDateError").text("Required minimum " + a + " nights to be selected."), !1;
        }
        validateBooking(!0) &&
            validateBookingDates() &&
            ((b = $.datepicker.formatDate("mm/dd/yy", new Date($("#hsdCheckInDate").val()))),
            (c = $.datepicker.formatDate("mm/dd/yy", new Date($("#hsdCheckOutDate").val()))),
            (a = filterResort($("#singleDestination").val())),
            destinationValidation(a.resortID) &&
                (new Date(c).getTime(), new Date(b).getTime(), getData("/bin/nodeutil.content__sterlingholidays__en__index__resorts-hotels__" + a.filename + "__jcr-content__par__resort_overall__data.json", getResortOverallData)));
    });
}
function clearBkRelatedSessionData() {
    deleteSessionData("packageFlag");
}
function offersAtTheResortInBookNow(a, b) {
    $("#singleDestination").val();
    var c = filterResort($("#singleDestination").val());
    $("#singleDestination").val() && (void 0 == c ? $("#chkAvb").attr("disabled", !0) : filterOffers(c.value, a, b));
    return [];
}
function filterOffers(a, b, c) {
    selectedResortName = a;
    a = GlobalConstants.URL.HSD.GET_VALID_PROMOS + "." + a.toLowerCase();
    getData(a, filterOffersResult);
}
function filterOffersResult(a) {
    var b = a.responseJSON,
        c = function (a) {
            return (
                '\n                 \x3cli class\x3d"col-md-4" onclick\x3d"goToOffersPage(\'' +
                a.promo +
                '\')"\x3e\n\t\t\x3cdiv class\x3d"media"\x3e\n\t\t\t\x3cdiv class\x3d"media-left"\x3e\n\t\t\t\t\x3cimg width\x3d"126" height\x3d"80" alt\x3d"offer image" class\x3d"card-image-top img001 lazy-loader lazyloaded" src\x3d"' +
                a.img +
                '"\x3e\n\t\t\t\x3c/div\x3e\n\t\t\t\x3cdiv class\x3d"media-body"\x3e\n\t\t\t\t\x3ch4 class\x3d"media-heading"\x3e\x3cdiv class\x3d"selected-text"\x3e' +
                a.description +
                '\x3c/div\x3e\x3c/h4\x3e\n\t\t\t\t\x3cspan class\x3d""\x3e' +
                a.type +
                "\x3c/span\x3e\n\t\t\t\x3c/div\x3e\n\t\t\x3c/div\x3e\n\t\x3c/li\x3e\n\t"
            );
        };
    if (b)
        if (0 < b.length) {
            a = [];
            $("#hsdCheckInDate").val();
            $("#hsdCheckOutDate").val();
            for (var d = 0; d < b.length; d++) {
                var e = b[d];
                if (e && e.body && e.body.startDate && currentDateGreaterCheckValidation(e.body.startDate))
                    if (e.promoForLoggedin && "true" == e.promoForLoggedin) {
                        var f = session_get();
                        f && f.isLoggedIn && a.push({ url: "", img: e.body.imageThumbnail, description: e.body.promoMsg, type: e.body.promotypeName, promo: e.promoCode });
                    } else a.push({ url: "", img: e.body.imageThumbnail, description: e.body.promoMsg, type: e.body.promotypeName, promo: e.promoCode });
            }
            $("#recommendedOffers").html(a.map(c).join(""));
            $("#selectedResort").html("RECOMMENDED OFFERS AT " + $("#singleDestination").val());
            a && 0 < a.length && $("#bookingOffersDiv").show();
        } else $("#recommendedOffers").html(""), $("#selectedResort").html(""), $("#bookingOffersDiv").hide();
}
function filterResort(a) {
    var b = RESORTDATA.filter(function (b) {
        return b.value.trim() == a.trim();
    });
    0 < b.length && (b = b[0]);
    return b;
}
function filterRoom(a, b) {
    a = filterResort(a).roomInfo;
    0 < a.length &&
        (a = a.filter(function (a) {
            return a.roomId.trim() == b;
        }));
    return a;
}
function destinationValidation(a) {
    return 0 <
        RESORTDATA.filter(function (b) {
            return b.resortID == a;
        }).length
        ? !0
        : !1;
}
function getOccupancyDetailsArr(a) {
    var b = [];
    if (a)
        if (Array.isArray(a))
            for (var c = 0; c < a.length; c++) {
                var d = {};
                var e = "string" == typeof a[c] ? JSON.parse(a[c]) : a[c];
                d.roomId = e.roomID;
                d.maxOccupancyCount = e.maxOccupancyCount;
                d.baseOccupancyCount = e.baseOccupancyCount;
                d.extraOccupancyAdultCount = e.extraOccupancyAdultCount;
                d.extraOccupancyChildCount = e.extraOccupancyChildCount;
                b.push(d);
            }
        else
            (d = {}),
                "string" === $.type(a) && (a = JSON.parse(a)),
                (d.roomId = a.roomID),
                (d.maxOccupancyCount = a.maxOccupancyCount),
                (d.baseOccupancyCount = a.baseOccupancyCount),
                (d.extraOccupancyAdultCount = a.extraOccupancyAdultCount),
                (d.extraOccupancyChildCount = a.extraOccupancyChildCount),
                b.push(d);
    return b;
}
function getResortOverallData(a) {
    a = a.responseJSON;
    var b = $.datepicker.formatDate("mm/dd/yy", new Date($("#hsdCheckInDate").val())),
        c = $.datepicker.formatDate("mm/dd/yy", new Date($("#hsdCheckOutDate").val()));
    setSessionData("resortID", a.resortID);
    setSessionData("destination", a.masterName);
    setSessionData("roomInfo", a.roomInfo);
    setSessionData("resortAddress", a.address);
    setSessionData("logo", a.resortpicture);
    setSessionData("resortBannerImage", a.heroImage);
    setSessionData("resortAmenities", a.resortAmenities);
    setSessionData("resortLogo", a.resortpicture);
    var d = JSON.stringify(a);
    setSessionData("selectedResortData", d);
    requestData = { additonalSuggestedDays: 5 };
    requestData.checkIn = b;
    requestData.checkOut = c;
    requestData.resortId = a.sfResortID;
    a.roomInfo && (requestData.occupancyDetails = getOccupancyDetailsArr(a.roomInfo));
    setSessionData("requestData", requestData);
    $("#isCorporate").prop("checked") && 0 < $("#corporateCode").val().trim().length
        ? (setSessionData("isCorporate", $("#isCorporate").prop("checked")),
          setSessionData("corporateCode", $("#corporateCode").val().trim()),
          (requestData.isCorporate = $("#isCorporate").prop("checked")),
          (requestData.corporateCode = $("#corporateCode").val().trim()),
          setSessionData("requestData", requestData),
          postData(GlobalConstants.URL.HSD.VALIDATE_CORPORATE_CODE, checkAvailability, requestData))
        : (setSessionData("requestData", requestData), checkAvailability());
}
function checkAvailability(a) {
    if (a && !a.data.valid) return $("#corporateCodeError").html(a.data.msg), $("#corporateCodeError").show(), !1;
    a = getSessionData("requestData");
    var b = filterResort($("#singleDestination").val());
    a.resortId = b.resortID;
    a.sfResortID = b.sfResortID;
    a.recommendedResorts = getAlternateResorts(b);
    deleteSessionData("requestData");
    postData(GlobalConstants.URL.HSD.GETROOMS_AVAILABILITY, getAvailablelity, a);
    $("#corporateCodeError").hide();
}
function validateCircularAvailablity() {
    if (1 < resortCircularList.length) {
        for (var a = 0; a < resortCircularList.length; a++) {
            for (var b = 0; b < resortPlans.length; b++)
                parseInt(resortPlans[b].ratePlanId) == parseInt(selectedCircularRatePlan.ratePlanId) &&
                    (resortCircularList[a].ratePlan = { ratePlanId: resortPlans[b].ratePlanId, ratePlan: resortPlans[b].ratePlan, ratePlanDetail: resortPlans[b].ratePlanDetail });
            resortCircularList[a].roomDetails = {};
            resortCircularList[a].roomDetails.adultCount = parseInt($("#hsdCircularTotalAdultcount").val());
            resortCircularList[a].roomDetails.childCount = parseInt($("#hsdCircularTotalChildcount").val());
        }
        postData(GlobalConstants.URL.HSD.CHECK_CIRCULAR_AVAILABILITY, successCallbackForCircularHSD, resortCircularList);
    }
}
function getAvailablelity(a) {
    a &&
        (setSessionData("availData", a),
        setHSDBookingSingleCitySessionData(),
        validateCheckAvailability(a)
            ? ((url = "/bin/nodeutil.content__sterlingholidays__en__index__main-authoring-dialog__jcr-content__par__author_dialog.property__rateplantype.json"), getData(url, getRatePlanData))
            : (window.location = PAGE.roomRooms));
}
function getRatePlanData(a) {
    a = a.responseJSON;
    var b = [],
        c = getSessionData("availData").data,
        d = getSessionData("availData");
    deleteSessionData("availData");
    for (var e = 0; e < c.resortAvailability.length; e++) {
        if (0 < c.resortAvailability[e].availableRooms && "undefined" !== typeof c.resortAvailability[e].roomRatePlanList && 0 < c.resortAvailability[e].roomRatePlanList.length) {
            for (var f = [], k = 0; k < c.resortAvailability[e].roomRatePlanList.length; k++) {
                for (var h = !0, g = 0; g < a.rateplantype.length; g++)
                    "true" == JSON.parse(a.rateplantype[g]).enableRatePlan[0] && c.resortAvailability[e].roomRatePlanList[k].ratePlan == JSON.parse(a.rateplantype[g]).ratePlanId && (h = !1);
                h && f.push(c.resortAvailability[e].roomRatePlanList[k]);
            }
            d.data.resortAvailability[e].roomRatePlanList = f;
        }
        d.data.resortAvailability[e].roomRatePlanList && 0 < d.data.resortAvailability[e].roomRatePlanList.length && b.push(d.data.resortAvailability[e]);
    }
    d.data.resortAvailability = b;
    setHSDBookingSingleCitySessionData();
    validateCheckAvailability(d) ? (window.location = PAGE.hsdResult) : (window.location = PAGE.roomRooms);
}
function setHSDBookingSingleCitySessionData() {
    setSessionData("startDate", $("#hsdCheckInDate").val());
    setSessionData("endDate", $("#hsdCheckOutDate").val());
    var a = $.datepicker.formatDate("mm/dd/yy", new Date($("#hsdCheckInDate").val())),
        b = $.datepicker.formatDate("mm/dd/yy", new Date($("#hsdCheckOutDate").val()));
    a = Math.round((new Date(b).getTime() - new Date(a).getTime()) / 864e5);
    setSessionData("duration", a.toString());
    setSessionData("adultCount", "1");
    setSessionData("childrenCount", "1");
    setSessionData("roomCount", "1");
    setSessionData("filename", filterResort($("#singleDestination").val()).filename);
    deleteSessionData("selectedRoomsArray");
    deleteSessionData("selectedRoomDetailsObj");
}
function validateCheckAvailability(a) {
    var b = !1;
    "success" == a.status && !a.data.suggested && a.data.resortAvailability && 0 < a.data.resortAvailability.length
        ? ((b = !0), setSessionData("responseData", a.data))
        : ("success" == a.status && a.data.suggested) || ("success" == a.status && a.data.resortAvailability && 0 == a.data.resortAvailability.length)
        ? ((b = !1), sessionStorage.removeItem("responseSuggestedData"), setSessionData("responseSuggestedData", a.data))
        : "failed" == a.status && ((b = !1), sessionStorage.responseSuggestedData && sessionStorage.removeItem("responseSuggestedData"));
    1 != $("#f-dates").prop("checked") && ($(".selected-offer-text").hasClass("offer-Selected") || setSessionData("isCurcular", !1));
    return b;
}
function showHsdBooking() {
    $("#hsdBooking").addClass("active");
    $("#hsdCircularBooking").removeClass("active");
    $("#bookingOffersDiv").hide();
    $(".single-city").prop("checked", !0);
    validateBooking(!1);
}
function showCircularBooking() {
    $("#bookingOffersDiv").hide();
    $(".multi-city").prop("checked", !0);
    $("#hsdCircularBooking").addClass("active");
    $("#hsdBooking").removeClass("active");
    (void 0 != $("#hsdCircularTotalAdultcount").val() && "" != $("#hsdCircularTotalAdultcount").val()) || $("#hsdCircularTotalAdultcount").val("1");
    (void 0 != $("#hsdCircularTotalChildcount").val() && "" != $("#hsdCircularTotalChildcount").val()) || $("#hsdCircularTotalChildcount").val("1");
    $("#circular-datasets .typeahead").on("typeahead:selected", function (a, b) {
        appendCircularResort(b.value);
        $(this).typeahead("val", "");
        $(this).trigger("blur");
    });
}
function appendCircularResort(a) {
    if ($("#hsdCircularCheckInDate").val()) {
        if (($("#hsdCircularCheckInDateError").html(""), a && $("#hsdCircularCheckInDate").val())) {
            var b = new Date($("#hsdCircularCheckInDate").val());
            var c = filterResort(a);
            var d = !0;
            if (0 < resortCircularList.length) {
                void 0 != resortCircularList[resortCircularList.length - 1].endDate && (b = resortCircularList[resortCircularList.length - 1].endDate);
                for (var e = 0; e < resortCircularList.length; e++) (resortCircularList[e] ? resortCircularList[e].masterName : "") == a && (d = !1);
            } else d = !0;
            d &&
                ((d = {}),
                (d.masterName = a),
                (d.noOfNights = 1),
                (d.resortId = c.resortID),
                (d.resortID = c.resortID),
                (d.sfResortID = c.sfResortID),
                (d.additonalSuggestedDays = 15),
                (d.formatStartDate = moment(b).format("DD MMM")),
                (d.formatEndDate = moment(b).format("DD MMM")),
                (d.checkIn = moment(b).format("MM/DD/YYYY")),
                (d.startDate = b),
                (c = moment(b).add(1, "days").toDate()),
                (d.checkOut = moment(c).format("MM/DD/YYYY")),
                (d.formatEndDate = moment(c).format("DD MMM")),
                (d.endDate = c),
                (d.occupancyDetails = filterRoom(a, "1")),
                (d.error = ""),
                (d.roomDetails = {}),
                (d.roomDetails.adultCount = parseInt($("#hsdCircularTotalAdultcount").val())),
                (d.roomDetails.childCount = parseInt($("#hsdCircularTotalChildcount").val())),
                resortCircularList.push(d),
                moment(b).add(1, "days").toDate(),
                updateCircularResortNights(d, d.noOfNights));
            checkCircularAvailablity();
        }
    } else $("#hsdCircularCheckInDateError").html("Booking start date is Required");
}
function checkCircularAvailablity() {
    1 < resortCircularList.length && postData(GlobalConstants.URL.HSD.CHECK_CIRCULAR_AVAILABILITY, getCircularAvailablity, resortCircularList);
}
function successCallbackForCircularHSD(a) {
    "success" == a.status && 0 < a.data.length
        ? (setSessionData("responseData", a.data), checkResortCircularAvailablity(a.data))
        : "success" == a.status && 0 == a.data.length
        ? setSessionData("responseData", a.data)
        : "failed" == a.status && deleteSessionData("responseData");
}
function checkResortCircularAvailablity(a) {
    for (var b = !1, c = 0; c < resortCircularList.length; c++) {
        resortCircularList[c].error = "ERROR";
        for (var d = 0; d < a.length; d++)
            if (parseInt(a[d].resortId) == parseInt(resortCircularList[c].resortId))
                if (void 0 != a[d].resortAvailability && 0 >= a[d].resortAvailability.length) (resortCircularList[c].error = "Resort not available for selected date. Please select alternate date."), (b = !0);
                else
                    for (var e = 0; e < a[d].resortAvailability.length; e++)
                        0 >= a[d].resortAvailability[e].availableRooms ? ((resortCircularList[c].error = "Resort not available for selected date. Please select alternate date."), (b = !0)) : (resortCircularList[c].error = "");
    }
    for (a = 0; a < resortCircularList.length; a++) "ERROR" == resortCircularList[a].error && ((resortCircularList[a].error = "Resort not available for selected date. Please select alternate date."), (b = !0));
    setSessionData("logo", $(".logo.hidden-xs").attr("src"));
    b ? updateCircularResort() : (setSessionData("isCurcular", !0), (window.location = PAGE.hsdResult));
}
function getCircularAvailablity(a) {
    var b = a.data;
    a = [];
    for (var c = 0; c < resortCircularList.length; c++) {
        a.push(resortCircularList[c].resortID);
        for (var d = 0; d < b.length; d++) {
            for (var e = b[d], f = a.indexOf(e.resortId); -1 !== f; ) a.splice(f, 1), (f = a.indexOf(e.resortId));
            resortCircularList[c].error = "";
            if (void 0 != e.resortAvailability && 0 < e.resortAvailability.length)
                for (f = 0; f < e.resortAvailability.length; f++)
                    for (var k = 0; k < e.resortAvailability[f].roomRatePlanList.length; k++) {
                        var h = !0,
                            g = e.resortAvailability[f].roomRatePlanList[k].ratePlan;
                        RATEPLANS[g] && (RATEPLANS[g].hasOwnProperty("enableRatePlan") ? "true" == RATEPLANS[g].enableRatePlan[0] && g == RATEPLANS[g].ratePlanId && (h = !1) : g == RATEPLANS[g].ratePlanId && (h = !1));
                        h && ((h = e.resortAvailability[f].roomRatePlanList[k]), (g = {}), (g.ratePlanId = h.ratePlanId), (g.ratePlan = h.ratePlan), (g.ratePlanDetail = h.ratePlanDetail), resortPlans.push(g));
                    }
        }
    }
    for (b = 0; b < resortCircularList.length; b++)
        for (f = a.indexOf(resortCircularList[b].resortID); -1 !== f; )
            a.splice(f, 1), (resortCircularList[b].error = "Resort not available for selected date. Please select alternate date."), (f = a.indexOf(resortCircularList[b].resortId));
    resortPlans = getUnique(resortPlans, "ratePlanId");
    $("#hsdCircularMealPlans").html(
        resortPlans
            .map(function (a) {
                return "\x3cli\x3e\n\t\t\x3ca onclick\x3d\"selectedResortPlan('" + a.ratePlanId + '\')" href\x3d"#"\x3e' + a.ratePlan + " " + a.ratePlanDetail + "\x3c/a\x3e\n\t\x3c/li\x3e";
            })
            .join("")
    );
    $("#salu_meal_book").selectpicker("refresh");
    updateCircularResort();
}
function setCircularRatePlan() {
    2 > resortCircularList.length
        ? ((resortPlans = []),
          $("#recommendedOffers").html(""),
          $("#salu_meal_book").selectpicker("refresh"),
          (selectedCircularRatePlan = void 0),
          $("#hsdCircularMaxResortError").html("Minimum 2 Resorts need to book."),
          $("#chkCircularAvb").disableButton())
        : 4 < resortCircularList.length
        ? ($("#hsdCircularMaxResortError").html("Maximum 4 Resorts can boot at a time."), $("#chkCircularAvb").disableButton())
        : ($("#hsdCircularMaxResortError").html(""),
          0 >= resortPlans.length ? ($("#resortPlanDiv").hide(), $("#chkCircularAvb").disableButton()) : $("#resortPlanDiv").show(),
          15 < parseInt($("#hsdCircularTotalAdultcount").val()) + parseInt($("#hsdCircularTotalChildcount").val())
              ? ($("#hsdCircularMaxPeopleError").html("Maximum Number of people is 15.\x3c/br\x3e(including children)"), $("#chkCircularAvb").disableButton())
              : ($("#hsdCircularMaxPeopleError").html(""),
                void 0 == selectedCircularRatePlan
                    ? ($("#hsdCircularRatePlanError").html("Meal plan required."), $("#chkCircularAvb").disableButton())
                    : ($("#hsdCircularRatePlanError").html(""), 2 <= resortCircularList.length && $("#hsdCircularCheckInDate").val() && void 0 != selectedCircularRatePlan && $("#chkCircularAvb").enableButton())));
}
function selectedResortPlan(a) {
    for (var b = 0; b < resortPlans.length; b++)
        parseInt(resortPlans[b].ratePlanId) == parseInt(a) &&
            ((selectedCircularRatePlan = resortPlans[b])
                ? $("#selectedCircularMealPlan").html(resortPlans[b].ratePlan + " " + resortPlans[b].ratePlanDetail)
                : ($("#selectedCircularMealPlan").html("Meal Plans"), (selectedCircularRatePlan = void 0)));
    setCircularRatePlan();
}
function getUnique(a, b) {
    return a
        .map(function (a) {
            return a[b];
        })
        .map(function (a, b, e) {
            return e.indexOf(a) === b && b;
        })
        .filter(function (b) {
            return a[b];
        })
        .map(function (b) {
            return a[b];
        });
}
function updateCircularResortNights(a, b) {
    for (var c = new Date($("#hsdCircularCheckInDate").val()), d = !1, e = 0; e < resortCircularList.length; e++) {
        var f = resortCircularList[e];
        d &&
            ((f.formatStartDate = moment(c).format("DD MMM")),
            (f.checkIn = moment(c).format("MM/DD/YYYY")),
            (f.startDate = c),
            (c = moment(c).add(f.noOfNights, "days").toDate()),
            (f.checkOut = moment(c).format("MM/DD/YYYY")),
            (f.formatEndDate = moment(c).format("DD MMM")),
            (f.endDate = c),
            (c = moment(c).add(0, "days").toDate()));
        parseInt(f.resortId) == parseInt(a) &&
            ((d = !0),
            (f.noOfNights = b),
            (c = moment(f.startDate).add(b, "days").toDate()),
            (f.checkOut = moment(c).format("MM/DD/YYYY")),
            (f.endDate = c),
            (f.formatEndDate = moment(c).format("DD MMM")),
            (c = moment(c).add(0, "days").toDate()));
        resortCircularList[e] = f;
    }
    updateCircularResort();
}
function renderCirularNights(a, b) {
    for (var c = [], d = 1; 10 >= d; d++) c.push({ resortId: a, noOfNights: b, night: d });
    return c
        .map(function (a) {
            var b = a.night;
            return (
                '\n    \x3cli ng-repeat\x3d"option in nights" class\x3d"ng-scope"\x3e\n        \x3ca onclick\x3d"updateCircularResortNights(' +
                a.resortId +
                "," +
                b +
                ')" href\x3d"#" ' +
                renderSelectedNight(b, a.noOfNights) +
                "\x3e" +
                b +
                "\x3c/a\x3e\n\t\x3c/li\x3e\n    "
            );
        })
        .join("");
}
function renderSelectedNight(a, b) {
    return [{ night: a, resortNight: b }]
        .map(function (a) {
            var b = a.resortNight;
            return parseInt(a.night) == parseInt(b) ? "selected" : "";
        })
        .join("");
}
function deleteCircularResort(a) {
    for (var b = 0; b < resortCircularList.length; b++) parseInt(resortCircularList[b].resortId) == parseInt(a) && (resortCircularList.splice(b, 1), b--);
    updateCircularResort();
}
function remapCircularResort() {
    for (var a = new Date($("#hsdCircularCheckInDate").val()), b = 0; b < resortCircularList.length; b++) {
        var c = resortCircularList[b];
        c.formatStartDate = moment(a).format("DD MMM");
        c.checkIn = moment(a).format("MM/DD/YYYY");
        c.startDate = a;
        a = moment(a).add(c.noOfNights, "days").toDate();
        c.checkOut = moment(a).format("MM/DD/YYYY");
        c.formatEndDate = moment(a).format("DD MMM");
        c.endDate = a;
        a = moment(a).add(0, "days").toDate();
        resortCircularList[b] = c;
    }
    updateCircularResort();
}
function updateCircularResort() {
    $("#resortCircularList").html(
        resortCircularList
            .map(function (a) {
                var b = a.error,
                    c = a.resortId,
                    d = a.noOfNights;
                return (
                    '\x3cli class\x3d"item ng-scope"  id\x3d"circularResort-' +
                    c +
                    '"\x3e\n\t\t\t\t\t\x3cdiv class\x3d"col-sm-12 col-md-12 col-lg-12 outder-div"\x3e\n\t\t\t\t\t\t\x3cdiv class\x3d"col-sm-5 col-md-5 col-lg-5"\x3e\n\t\t\t\t\t\t\t\x3clabel class\x3d"label ng-binding"\x3e' +
                    a.masterName +
                    '\x3c/label\x3e\n\t\t\t\t\t\t\t\x3cspan class\x3d"invalid"\x3e' +
                    (void 0 == b ? "" : b) +
                    '\x3c/span\x3e\n\t\t\t\t\t\t\x3c/div\x3e\n\t\t\t\t\t\t\x3cdiv class\x3d"col-sm-2 col-md-2 col-lg-2 date-div"\x3e\n\t\t\t\t\t\t\t\x3cdiv class\x3d"col-sm-6 col-md-6 col-lg-6 indate"\x3e\n\t\t\t\t\t\t\t\t\x3cspan\x3eIN\x3c/span\x3e\n\t\t\t\t\t\t\t\t\x3cdiv class\x3d"ng-binding"\x3e' +
                    a.formatStartDate +
                    '\x3c/div\x3e\n\t\t\t\t\t\t\t\x3c/div\x3e\n\t\t\t\t\t\t\t\x3cdiv class\x3d"col-sm-6 col-md-6 col-lg-6 indate noborder"\x3e\n\t\t\t\t\t\t\t\t\x3cdiv\x3eOUT\x3c/div\x3e\n\t\t\t\t\t\t\t\t\x3cdiv class\x3d"ng-binding"\x3e' +
                    a.formatEndDate +
                    '\x3c/div\x3e\n\t\t\t\t\t\t\t\x3c/div\x3e\n\t\t\t\t\t\t\x3c/div\x3e\n\t\t\t\t\t\t\x3cdiv class\x3d"col-sm-2 col-md-2 col-lg-2 nights"\x3e\n\t\t\t\t\t\t\t\x3cdiv class\x3d"col-sm-6 col-md-6 col-lg-6 night"\x3e\n\t\t\t\t\t\t\t\tNIGHT\n\t\t\t\t\t\t\t\x3c/div\x3e\n\t\t\t\t\t\t\t\x3cdiv class\x3d"col-sm-6 col-md-6 col-lg-6 innernight"\x3e\n\t\t\t\t\t\t\t\t\x3cdiv class\x3d"form-blocks form-container pdb-0"\x3e\n\t\t\t\t\t\t\t\t\t\x3cdiv class\x3d"dropdown"\x3e\n\t\t\t\t\t\t\t\t\t\t\x3cinput type\x3d"text" id\x3d"noOfNights" value\x3d"' +
                    d +
                    '" class\x3d"hidden ng-pristine ng-untouched ng-valid" autocomplete\x3d"off"\x3e\n\t\t\t\t\t\t\t\t\t\t\x3cbutton class\x3d"custom-caret" style\x3d"width: 43px; background-color: transparent; text-decoration: none; border: 0; padding: 0; text-align: left;" type\x3d"button" data-toggle\x3d"dropdown"\x3e\n\t\t\t\t\t\t\t\t\t\t\t\x3cspan class\x3d"ng-binding"\x3e' +
                    d +
                    '\x3c/span\x3e\n\t\t\t\t\t\t\t\t\t\t\x3c/button\x3e\n\t\t\t\t\t\t\t\t\t\t\x3cul class\x3d"dropdown-menu"\x3e\n\t\t\t\t\t\t\t\t\t\t\t' +
                    renderCirularNights(c, d) +
                    '\n\t\t\t\t\t\t\t\t\t\t\x3c/ul\x3e\n\t\t\t\t\t\t\t\t\t\x3c/div\x3e\n\t\t\t\t\t\t\t\t\x3c/div\x3e\n\t\t\t\t\t\t\t\x3c/div\x3e\n\t\t\t\t\t\t\x3c/div\x3e\n\t\t\t\t\t\t\x3cdiv class\x3d"col-sm-2 col-md-2 col-lg-2 handle glyphicon glyphicon-move move-cursor"\x3e\x3c/div\x3e\n\t\t\t\t\t\t\x3cdiv class\x3d"col-sm-2 col-md-2 col-lg-2 "\x3e\n\t\t\t\t\t\t\t\x3cbutton title\x3d"Close" type\x3d"button" class\x3d"close delete" onclick\x3d"deleteCircularResort(' +
                    c +
                    ')"\x3e\n\t\t\t\t\t\t\t\t\x3cspan aria-hidden\x3d"true"\x3e\u00d7\x3c/span\x3e\n\t\t\t\t\t\t\t\x3c/button\x3e\n\t\t\t\t\t\t\x3c/div\x3e\n\t\t\t\t\t\x3c/div\x3e\n\t\t\t\t\x3c/li\x3e'
                );
            })
            .join("")
    );
    setCircularRatePlan();
}
adultincrement = function () {
    var a = parseInt($("#hsdCircularTotalAdultcount").val());
    a++;
    $("#hsdCircularTotalAdultcount").val(a);
    hsdCircularMaxChildCount = 2 * a;
};
adultdecrement = function () {
    var a = parseInt($("#hsdCircularTotalAdultcount").val()),
        b = parseInt($("#hsdCircularTotalChildcount").val());
    1 < a ? a-- : (a = 1);
    hsdCircularMaxChildCount = 2 * a;
    hsdCircularMaxChildCount < b && (b = hsdCircularMaxChildCount);
    $("#hsdCircularTotalChildcount").val(b);
    $("#hsdCircularTotalAdultcount").val(a);
};
childdecrement = function () {
    var a = parseInt($("#hsdCircularTotalAdultcount").val()),
        b = parseInt($("#hsdCircularTotalChildcount").val());
    0 < b ? b-- : (b = 0);
    $("#hsdCircularTotalChildcount").val(b);
    $("#hsdCircularTotalAdultcount").val(a);
};
childincrement = function () {
    var a = parseInt($("#hsdCircularTotalChildcount").val());
    hsdCircularMaxChildCount > a && a++;
    $("#hsdCircularTotalChildcount").val(a);
};
latestOffersForCheckInDate = function () {
    filterResort($("#singleDestination").val());
};
latestOffersForCheckOutDate = function () {};
goToOffersPage = function (a) {
    selectedPromoOfferCode = a;
    getAllPromoOffer();
};
getAllPromoOffer = function () {
    var a = GlobalConstants.URL.HSD.GET_VALID_PROMOS + "." + selectedResortName.toLowerCase();
    getData(a, filterPromoOffersResult);
};
filterPromoOffersResult = function (a) {
    a = a.responseJSON;
    var b = {};
    if (a)
        if (0 < a.length) for (var c = 0; c < a.length; c++) a[c] && a[c].body && a[c].body.startDate && currentDateGreaterCheckValidation(a[c].body.startDate) && a[c].promoCode == selectedPromoOfferCode && (b = a[c]);
        else selectedPromoOfferCode = selectedResortName = "";
    else selectedPromoOfferCode = selectedResortName = "";
    b && applyPromoForResortBooking("", b);
};
$(document).ready(function () {
    console.log("MEMBER");
    $("#companyDiv").hide();
    $("#travelAgencyDiv").hide();
    $("#modal-authentication").on("shown.bs.modal", function () {
        getAdminData();
    });
    $(document).on("click", "#eventTypeDropdownContact li", function () {
        console.log($(this));
        console.log($(this).data("value"));
        console.log("asdf");
        $("#selected-event-enquiry_mice1").html($(this).data("value"));
        $("#selected-event-enquiry_mice1").parent("dropdown").removeClass("open");
    });
    $(".form-blocks input[type\x3dtext],.form-blocks input[type\x3demail],.form-blocks input[type\x3dtel],.form-blocks input[type\x3dpassword]").focusin(function () {
        $(this).closest(".form-blocks").find(".floating-label").addClass("fl-active");
        $(".form-blocks").find(".input-bar").removeClass("active-bar");
        $(this).closest(".form-blocks").find(".input-bar").addClass("active-bar");
    });
    $(".form-blocks input[type\x3dtext],.form-blocks input[type\x3demail],.form-blocks input[type\x3dtel],.form-blocks input[type\x3dpassword]").focusout(function () {
        "" == $(this).val()
            ? ($(this).closest(".form-blocks").find(".floating-label").removeClass("fl-active"), $(this).closest(".form-blocks").find(".floating-label").addClass("fl-default"))
            : $(this).closest(".form-blocks").find(".floating-label").addClass("fl-active");
    });
    $("#loginBtn").click(function () {
        validateForm();
    });
    $("#attendees .selection-inputs").on({
        click: function (a) {
            a.stopPropagation();
        },
    });
    $(".check-availability").removeAttr("disabled");
});
function validateForm() {
    $("#memberEmailError").html("");
    $("#memberPasswordError").html("");
    var a = !0;
    $("#memberID").isEmpty() && ($("#memberEmailError").html(UIERRORS.EMAIL_REQUIRED), (a = !1));
    !$("#memberID").emailValidation() && a && ($("#memberEmailError").html(UIERRORS.EMAIL_INVALID), (a = !1));
    $("#memberPassword").isEmpty() && a && ($("#memberPasswordError").html(UIERRORS.PASSWORD_REQUIRED), (a = !1));
    var b = $("#memberPassword").passwordValidation();
    "" != b && a && ($("#memberPasswordError").html(b), (a = !1));
    a ? $("#loginBtn").enableButton() : $("#loginBtn").disableButton();
    return a;
}
function clearMemberValuesInBooking() {
    $(".multi-book").hide();
    $("#memberID").val("");
    $("#memberPassword").val("");
    $("#loginBtn").disableButton();
    $("#memberID").blur(function () {
        validateForm();
    });
    $("#memberPassword").blur(function () {
        validateForm();
    });
}
function getBookingEventDetails() {
    var a = "/bin/nodeutil.content__sterlingholidays__en__index__main-authoring-dialog__jcr-content__par__author_dialog.property__addEvent.property__countryList.json";
    getData(a, addEventDatas);
    a = "/bin/nodeutil.content__sterlingholidays__en__index__resorts-hotels.property__masterName.property__resortID.json";
    getData(a, getResortData);
    $(".multi-book").hide();
    $(".floating-label").removeClass("fl-active");
    $("#selected-event-enquiry_mice1").text = "";
    $("#in_mice_book").val("");
    $("#defaultText-enquiry").html("No. of Guests/ Attendees");
    $("#guest_countin1_mice_hsd").val("");
    $("#guest_countin1_hsd").val("");
    $(".defaulttxt-salutation").text("Mr.");
    $("#IndividualEnquiry_mice").prop("checked", !1);
    $("#agency_city_mice").prop("checked", !1);
    $("#corporate_city_mice").prop("checked", !1);
    $("#guest1-fname_mice_book").val("");
    $("#guest1-lname_mice_book").val("");
    $("#guest1-email_mice_book").val("");
    $("#guest1-mobile_mice_book").val("");
    $(".countries-mice-book .filter-option").html("Select Country");
    $(".states-mice-book .filter-option").html("Select Country");
    $(".cities-mice-book .filter-option").html("Select City");
    $("#countryLabelInBook").removeClass("fl-active");
    $("#stateLabelInBook").removeClass("fl-active");
    $("#cityLabelInBook").removeClass("fl-active");
    $(".guestsNo-enquiry").keyup(function () {
        if ("" !== $(this).val()) {
            if ("0" == $(this).val()) $(".guest-count-panel-enquiry").removeClass("hidden"), $(".guest-count-panel-enquiry").hide(), $(".defaultText-enquiry").show();
            else {
                $(".defaultText-enquiry").hide();
                $(".guest-count-panel-enquiry").show();
                $(".room-guest-panel-enquiry").show();
                var a = $(this).val();
                $(".guestCount-enquiry").text(a);
                $(".guest-count-panel-enquiry").removeClass("hidden");
            }
            $(".defaultText-enquiry").hide();
        } else $(".guest-count-panel-enquiry").hide(), $(".defaultText-enquiry").show();
        if (("0" == $(this).val() && "0" == $(".roomNo-enquiry").val()) || ("" == $(this).val() && "" == $(".roomNo-enquiry").val()))
            $(".room-count-panel-enquiry").hide(), $(".room-guest-panel-enquiry").hide(), $(".guest-count-panel-enquiry").hide(), $(".defaultText-enquiry").show();
    });
    $(document).on("click", ".countries-mice-book .dropdown-menu.inner li", function () {
        $(".countries-mice-book .filter-option").css("opacity", 1);
        $("#countryLabelInBook").addClass("fl-active");
        "Select Country" != $(".countries-mice-book .filter-option").html().trim() &&
            ((a = "https://beta-api.sterlingholidays.com/common/statesByCountry?country\x3d" + $(".countries-mice-book .filter-option").html().trim()), postData(a, getStateData));
        console.log($(".countries-mice-book .filter-option").html().trim());
        "India" != $(".countries-mice-book .filter-option").html().trim() && "" != $(".countries-mice-book .filter-option").html().trim()
            ? ($("#miceStateInBookDiv").hide(), $("#miceCityInBookDiv").hide(), $("#micePinCls,#miceAddressFormBlock").removeClass("micePinCls"))
            : ($("#miceStateInBookDiv").show(), $("#miceCityInBookDiv").show(), $("#micePinCls,#miceAddressFormBlock").addClass("micePinCls"));
    });
    $(document).on("click", ".states-mice-book .dropdown-menu.inner li", function () {
        $(".states-mice-book .filter-option").css("opacity", 1);
        $("#stateLabelInBook").addClass("fl-active");
        "Select State" != $(".states-mice-book .filter-option").html().trim() &&
            ((a = "https://beta-api.sterlingholidays.com/common/citiesByState?country\x3d" + $(".countries-mice-book .filter-option").html().trim() + "\x26state\x3d" + $(".states-mice-book .filter-option").html().trim()),
            postData(a, getCityData));
    });
    $(document).on("click", ".cities-mice-book .dropdown-menu.inner li", function () {
        $(".cities-mice-book .filter-option").css("opacity", 1);
        $("#cityLabelInBook").addClass("fl-active");
    });
    $(document).on("click", "input[name\x3d'Enquiring']", function () {
        var a = $("input[name\x3d'Enquiring']:checked").val();
        "Individual" == a && ($("#companyDiv").hide(), $("#travelAgencyDiv").hide());
        "Corporate" == a && ($("#companyDiv").show(), $("#travelAgencyDiv").hide());
        "Agent" == a && ($("#companyDiv").hide(), $("#travelAgencyDiv").show());
    });
}
function getStateData(a) {
    console.log(a);
    if (0 < a.data.length) {
        a = a.data;
        $("#miceStateIdInBook").empty();
        $("#miceStateIdInBook").append("\x3coption value\x3eSelect State\x3c/option\x3e");
        console.log(a);
        for (i = 0; i < a.length; i++) $("#miceStateIdInBook").append('\x3coption value\x3d"' + a[i].state + '" \x3e' + a[i].state + "\x3c/option\x3e");
        $("#miceStateIdInBook.selectpicker").selectpicker("refresh");
    }
}
function getCityData(a) {
    if (0 < a.data.length) {
        a = a.data;
        $("#miceCityIdInBook").empty();
        $("#miceCityIdInBook").append("\x3coption value\x3eSelect City\x3c/option\x3e");
        for (i = 0; i < a.length; i++) $("#miceCityIdInBook").append('\x3coption value\x3d"' + a[i].name + '" \x3e' + a[i].name + "\x3c/option\x3e");
        $("#miceCityIdInBook.selectpicker").selectpicker("refresh");
    }
}
function addEventDatas(a) {
    console.log(a);
    a = JSON.parse(a.responseText);
    var b = a.addEvent;
    $("#eventTypeDropdownContact").empty();
    for (i in b) {
        var c = JSON.parse(b[i]);
        c = "\x3cli data-value\x3d'" + c.value + "'\x3e" + c.text + "\x3c/li\x3e";
        $("#eventTypeDropdownContact").append(c);
    }
    b = a.countryList;
    $("#miceCountryIdInBook").empty();
    $("#miceCountryIdInBook").append("\x3coption value\x3eSelect Country\x3c/option\x3e");
    for (i in b) (c = JSON.parse(b[i])), $("#miceCountryIdInBook").append('\x3coption value\x3d"' + c.countryName + '" \x3e' + c.countryName + "\x3c/option\x3e");
    $("#miceCountryIdInBook.selectpicker").selectpicker("refresh");
}
var UIERRORS = {},
    RESORTDATA = [],
    ADMINDATA = {},
    VALIDOFFERS = [],
    RATEPLANS = [],
    API_ERROR = {},
    DATA_CACHE = {},
    countries = [
        { name: "Afghanistan", dial_code: "+93", code: "AF" },
        { name: "Albania", dial_code: "+355", code: "AL" },
        { name: "Algeria", dial_code: "+213", code: "DZ" },
        { name: "American Samoa", dial_code: "+1 684", code: "AS" },
        { name: "Andorra", dial_code: "+376", code: "AD" },
        { name: "Angola", dial_code: "+244", code: "AO" },
        { name: "Anguilla", dial_code: "+1 264", code: "AI" },
        { name: "Antigua and Barbuda", dial_code: "+1268", code: "AG" },
        { name: "Argentina", dial_code: "+54", code: "AR" },
        { name: "Armenia", dial_code: "+374", code: "AM" },
        { name: "Aruba", dial_code: "+297", code: "AW" },
        { name: "Australia", dial_code: "+61", code: "AU" },
        { name: "Austria", dial_code: "+43", code: "AT" },
        { name: "Azerbaijan", dial_code: "+994", code: "AZ" },
        { name: "Bahamas", dial_code: "+1 242", code: "BS" },
        { name: "Bahrain", dial_code: "+973", code: "BH" },
        { name: "Bangladesh", dial_code: "+880", code: "BD" },
        { name: "Barbados", dial_code: "+1 246", code: "BB" },
        { name: "Belarus", dial_code: "+375", code: "BY" },
        { name: "Belgium", dial_code: "+32", code: "BE" },
        { name: "Belize", dial_code: "+501", code: "BZ" },
        { name: "Benin", dial_code: "+229", code: "BJ" },
        { name: "Bermuda", dial_code: "+1 441", code: "BM" },
        { name: "Bhutan", dial_code: "+975", code: "BT" },
        { name: "Bosnia and Herzegovina", dial_code: "+387", code: "BA" },
        { name: "Botswana", dial_code: "+267", code: "BW" },
        { name: "Brazil", dial_code: "+55", code: "BR" },
        { name: "British Indian Ocean Territory", dial_code: "+246", code: "IO" },
        { name: "Bulgaria", dial_code: "+359", code: "BG" },
        { name: "Burkina Faso", dial_code: "+226", code: "BF" },
        { name: "Burundi", dial_code: "+257", code: "BI" },
        { name: "Cambodia", dial_code: "+855", code: "KH" },
        { name: "Cameroon", dial_code: "+237", code: "CM" },
        { name: "Canada", dial_code: "+1", code: "CA" },
        { name: "Cape Verde", dial_code: "+238", code: "CV" },
        { name: "Cayman Islands", dial_code: "+ 345", code: "KY" },
        { name: "Central African Republic", dial_code: "+236", code: "CF" },
        { name: "Chad", dial_code: "+235", code: "TD" },
        { name: "Chile", dial_code: "+56", code: "CL" },
        { name: "China", dial_code: "+86", code: "CN" },
        { name: "Christmas Island", dial_code: "+61", code: "CX" },
        { name: "Colombia", dial_code: "+57", code: "CO" },
        { name: "Comoros", dial_code: "+269", code: "KM" },
        { name: "Congo", dial_code: "+242", code: "CG" },
        { name: "Cook Islands", dial_code: "+682", code: "CK" },
        { name: "Costa Rica", dial_code: "+506", code: "CR" },
        { name: "Croatia", dial_code: "+385", code: "HR" },
        { name: "Cuba", dial_code: "+53", code: "CU" },
        { name: "Cyprus", dial_code: "+537", code: "CY" },
        { name: "Czech Republic", dial_code: "+420", code: "CZ" },
        { name: "Denmark", dial_code: "+45", code: "DK" },
        { name: "Djibouti", dial_code: "+253", code: "DJ" },
        { name: "Dominica", dial_code: "+1 767", code: "DM" },
        { name: "Dominican Republic", dial_code: "+1 849", code: "DO" },
        { name: "Ecuador", dial_code: "+593", code: "EC" },
        { name: "Egypt", dial_code: "+20", code: "EG" },
        { name: "El Salvador", dial_code: "+503", code: "SV" },
        { name: "Equatorial Guinea", dial_code: "+240", code: "GQ" },
        { name: "Eritrea", dial_code: "+291", code: "ER" },
        { name: "Estonia", dial_code: "+372", code: "EE" },
        { name: "Ethiopia", dial_code: "+251", code: "ET" },
        { name: "Faroe Islands", dial_code: "+298", code: "FO" },
        { name: "Fiji", dial_code: "+679", code: "FJ" },
        { name: "Finland", dial_code: "+358", code: "FI" },
        { name: "France", dial_code: "+33", code: "FR" },
        { name: "French Guiana", dial_code: "+594", code: "GF" },
        { name: "French Polynesia", dial_code: "+689", code: "PF" },
        { name: "Gabon", dial_code: "+241", code: "GA" },
        { name: "Gambia", dial_code: "+220", code: "GM" },
        { name: "Georgia", dial_code: "+995", code: "GE" },
        { name: "Germany", dial_code: "+49", code: "DE" },
        { name: "Ghana", dial_code: "+233", code: "GH" },
        { name: "Gibraltar", dial_code: "+350", code: "GI" },
        { name: "Greece", dial_code: "+30", code: "GR" },
        { name: "Greenland", dial_code: "+299", code: "GL" },
        { name: "Grenada", dial_code: "+1 473", code: "GD" },
        { name: "Guadeloupe", dial_code: "+590", code: "GP" },
        { name: "Guam", dial_code: "+1 671", code: "GU" },
        { name: "Guatemala", dial_code: "+502", code: "GT" },
        { name: "Guinea", dial_code: "+224", code: "GN" },
        { name: "Guinea-Bissau", dial_code: "+245", code: "GW" },
        { name: "Guyana", dial_code: "+595", code: "GY" },
        { name: "Haiti", dial_code: "+509", code: "HT" },
        { name: "Honduras", dial_code: "+504", code: "HN" },
        { name: "Hungary", dial_code: "+36", code: "HU" },
        { name: "Iceland", dial_code: "+354", code: "IS" },
        { name: "India", dial_code: "+91", code: "IN" },
        { name: "Indonesia", dial_code: "+62", code: "ID" },
        { name: "Iraq", dial_code: "+964", code: "IQ" },
        { name: "Ireland", dial_code: "+353", code: "IE" },
        { name: "Israel", dial_code: "+972", code: "IL" },
        { name: "Italy", dial_code: "+39", code: "IT" },
        { name: "Jamaica", dial_code: "+1 876", code: "JM" },
        { name: "Japan", dial_code: "+81", code: "JP" },
        { name: "Jordan", dial_code: "+962", code: "JO" },
        { name: "Kazakhstan", dial_code: "+7 7", code: "KZ" },
        { name: "Kenya", dial_code: "+254", code: "KE" },
        { name: "Kiribati", dial_code: "+686", code: "KI" },
        { name: "Kuwait", dial_code: "+965", code: "KW" },
        { name: "Kyrgyzstan", dial_code: "+996", code: "KG" },
        { name: "Latvia", dial_code: "+371", code: "LV" },
        { name: "Lebanon", dial_code: "+961", code: "LB" },
        { name: "Lesotho", dial_code: "+266", code: "LS" },
        { name: "Liberia", dial_code: "+231", code: "LR" },
        { name: "Liechtenstein", dial_code: "+423", code: "LI" },
        { name: "Lithuania", dial_code: "+370", code: "LT" },
        { name: "Luxembourg", dial_code: "+352", code: "LU" },
        { name: "Madagascar", dial_code: "+261", code: "MG" },
        { name: "Malawi", dial_code: "+265", code: "MW" },
        { name: "Malaysia", dial_code: "+60", code: "MY" },
        { name: "Maldives", dial_code: "+960", code: "MV" },
        { name: "Mali", dial_code: "+223", code: "ML" },
        { name: "Malta", dial_code: "+356", code: "MT" },
        { name: "Marshall Islands", dial_code: "+692", code: "MH" },
        { name: "Martinique", dial_code: "+596", code: "MQ" },
        { name: "Mauritania", dial_code: "+222", code: "MR" },
        { name: "Mauritius", dial_code: "+230", code: "MU" },
        { name: "Mayotte", dial_code: "+262", code: "YT" },
        { name: "Mexico", dial_code: "+52", code: "MX" },
        { name: "Monaco", dial_code: "+377", code: "MC" },
        { name: "Mongolia", dial_code: "+976", code: "MN" },
        { name: "Montenegro", dial_code: "+382", code: "ME" },
        { name: "Montserrat", dial_code: "+1664", code: "MS" },
        { name: "Morocco", dial_code: "+212", code: "MA" },
        { name: "Myanmar", dial_code: "+95", code: "MM" },
        { name: "Namibia", dial_code: "+264", code: "NA" },
        { name: "Nauru", dial_code: "+674", code: "NR" },
        { name: "Nepal", dial_code: "+977", code: "NP" },
        { name: "Netherlands", dial_code: "+31", code: "NL" },
        { name: "Netherlands Antilles", dial_code: "+599", code: "AN" },
        { name: "New Caledonia", dial_code: "+687", code: "NC" },
        { name: "New Zealand", dial_code: "+64", code: "NZ" },
        { name: "Nicaragua", dial_code: "+505", code: "NI" },
        { name: "Niger", dial_code: "+227", code: "NE" },
        { name: "Nigeria", dial_code: "+234", code: "NG" },
        { name: "Niue", dial_code: "+683", code: "NU" },
        { name: "Norfolk Island", dial_code: "+672", code: "NF" },
        { name: "Northern Mariana Islands", dial_code: "+1 670", code: "MP" },
        { name: "Norway", dial_code: "+47", code: "NO" },
        { name: "Oman", dial_code: "+968", code: "OM" },
        { name: "Pakistan", dial_code: "+92", code: "PK" },
        { name: "Palau", dial_code: "+680", code: "PW" },
        { name: "Panama", dial_code: "+507", code: "PA" },
        { name: "Papua New Guinea", dial_code: "+675", code: "PG" },
        { name: "Paraguay", dial_code: "+595", code: "PY" },
        { name: "Peru", dial_code: "+51", code: "PE" },
        { name: "Philippines", dial_code: "+63", code: "PH" },
        { name: "Poland", dial_code: "+48", code: "PL" },
        { name: "Portugal", dial_code: "+351", code: "PT" },
        { name: "Puerto Rico", dial_code: "+1 939", code: "PR" },
        { name: "Qatar", dial_code: "+974", code: "QA" },
        { name: "Romania", dial_code: "+40", code: "RO" },
        { name: "Rwanda", dial_code: "+250", code: "RW" },
        { name: "Samoa", dial_code: "+685", code: "WS" },
        { name: "San Marino", dial_code: "+378", code: "SM" },
        { name: "Saudi Arabia", dial_code: "+966", code: "SA" },
        { name: "Senegal", dial_code: "+221", code: "SN" },
        { name: "Serbia", dial_code: "+381", code: "RS" },
        { name: "Seychelles", dial_code: "+248", code: "SC" },
        { name: "Sierra Leone", dial_code: "+232", code: "SL" },
        { name: "Singapore", dial_code: "+65", code: "SG" },
        { name: "Slovakia", dial_code: "+421", code: "SK" },
        { name: "Slovenia", dial_code: "+386", code: "SI" },
        { name: "Solomon Islands", dial_code: "+677", code: "SB" },
        { name: "South Africa", dial_code: "+27", code: "ZA" },
        { name: "South Georgia and the South Sandwich Islands", dial_code: "+500", code: "GS" },
        { name: "Spain", dial_code: "+34", code: "ES" },
        { name: "Sri Lanka", dial_code: "+94", code: "LK" },
        { name: "Sudan", dial_code: "+249", code: "SD" },
        { name: "Suriname", dial_code: "+597", code: "SR" },
        { name: "Swaziland", dial_code: "+268", code: "SZ" },
        { name: "Sweden", dial_code: "+46", code: "SE" },
        { name: "Switzerland", dial_code: "+41", code: "CH" },
        { name: "Tajikistan", dial_code: "+992", code: "TJ" },
        { name: "Thailand", dial_code: "+66", code: "TH" },
        { name: "Togo", dial_code: "+228", code: "TG" },
        { name: "Tokelau", dial_code: "+690", code: "TK" },
        { name: "Tonga", dial_code: "+676", code: "TO" },
        { name: "Trinidad and Tobago", dial_code: "+1 868", code: "TT" },
        { name: "Tunisia", dial_code: "+216", code: "TN" },
        { name: "Turkey", dial_code: "+90", code: "TR" },
        { name: "Turkmenistan", dial_code: "+993", code: "TM" },
        { name: "Turks and Caicos Islands", dial_code: "+1 649", code: "TC" },
        { name: "Tuvalu", dial_code: "+688", code: "TV" },
        { name: "Uganda", dial_code: "+256", code: "UG" },
        { name: "Ukraine", dial_code: "+380", code: "UA" },
        { name: "United Arab Emirates", dial_code: "+971", code: "AE" },
        { name: "United Kingdom", dial_code: "+44", code: "GB" },
        { name: "United States", dial_code: "+1", code: "US" },
        { name: "Uruguay", dial_code: "+598", code: "UY" },
        { name: "Uzbekistan", dial_code: "+998", code: "UZ" },
        { name: "Vanuatu", dial_code: "+678", code: "VU" },
        { name: "Wallis and Futuna", dial_code: "+681", code: "WF" },
        { name: "Yemen", dial_code: "+967", code: "YE" },
        { name: "Zambia", dial_code: "+260", code: "ZM" },
        { name: "Zimbabwe", dial_code: "+263", code: "ZW" },
        { name: "land Islands", dial_code: "+358", code: "AX" },
        { name: "Antarctica", dial_code: "+672", code: "AQ" },
        { name: "Bolivia, Plurinational State of", dial_code: "+591", code: "BO" },
        { name: "Brunei Darussalam", dial_code: "+673", code: "BN" },
        { name: "Cocos (Keeling) Islands", dial_code: "+61", code: "CC" },
        { name: "Congo, The Democratic Republic of the", dial_code: "+243", code: "CD" },
        { name: "Cote d'Ivoire", dial_code: "+225", code: "CI" },
        { name: "Falkland Islands (Malvinas)", dial_code: "+500", code: "FK" },
        { name: "Guernsey", dial_code: "+44", code: "GG" },
        { name: "Holy See (Vatican City State)", dial_code: "+379", code: "VA" },
        { name: "Hong Kong", dial_code: "+852", code: "HK" },
        { name: "Iran, Islamic Republic of", dial_code: "+98", code: "IR" },
        { name: "Isle of Man", dial_code: "+44", code: "IM" },
        { name: "Jersey", dial_code: "+44", code: "JE" },
        { name: "Korea, Democratic People's Republic of", dial_code: "+850", code: "KP" },
        { name: "Korea, Republic of", dial_code: "+82", code: "KR" },
        { name: "Lao People's Democratic Republic", dial_code: "+856", code: "LA" },
        { name: "Libyan Arab Jamahiriya", dial_code: "+218", code: "LY" },
        { name: "Macao", dial_code: "+853", code: "MO" },
        { name: "Macedonia, The Former Yugoslav Republic of", dial_code: "+389", code: "MK" },
        { name: "Micronesia, Federated States of", dial_code: "+691", code: "FM" },
        { name: "Moldova, Republic of", dial_code: "+373", code: "MD" },
        { name: "Mozambique", dial_code: "+258", code: "MZ" },
        { name: "Palestinian Territory, Occupied", dial_code: "+970", code: "PS" },
        { name: "Pitcairn", dial_code: "+872", code: "PN" },
        { name: "R\u00e9union", dial_code: "+262", code: "RE" },
        { name: "Russia", dial_code: "+7", code: "RU" },
        { name: "Saint Barth\u00e9lemy", dial_code: "+590", code: "BL" },
        { name: "Saint Helena, Ascension and Tristan Da Cunha", dial_code: "+290", code: "SH" },
        { name: "Saint Kitts and Nevis", dial_code: "+1 869", code: "KN" },
        { name: "Saint Lucia", dial_code: "+1 758", code: "LC" },
        { name: "Saint Martin", dial_code: "+590", code: "MF" },
        { name: "Saint Pierre and Miquelon", dial_code: "+508", code: "PM" },
        { name: "Saint Vincent and the Grenadines", dial_code: "+1 784", code: "VC" },
        { name: "Sao Tome and Principe", dial_code: "+239", code: "ST" },
        { name: "Somalia", dial_code: "+252", code: "SO" },
        { name: "Svalbard and Jan Mayen", dial_code: "+47", code: "SJ" },
        { name: "Syrian Arab Republic", dial_code: "+963", code: "SY" },
        { name: "Taiwan, Province of China", dial_code: "+886", code: "TW" },
        { name: "Tanzania, United Republic of", dial_code: "+255", code: "TZ" },
        { name: "Timor-Leste", dial_code: "+670", code: "TL" },
        { name: "Venezuela, Bolivarian Republic of", dial_code: "+58", code: "VE" },
        { name: "Viet Nam", dial_code: "+84", code: "VN" },
        { name: "Virgin Islands, British", dial_code: "+1 284", code: "VG" },
        { name: "Virgin Islands, U.S.", dial_code: "+1 340", code: "VI" },
    ];
$(document).ready(function () {
    CountryCodes();
    $("#modal-authentication").on("shown.bs.modal", function () {
        CountryCodes();
    });
    getData("/bin/nodeutil.content__sterlingholidays__en__index__main-authoring-dialog__jcr-content__par__author_dialog.property__uierrorconfig.property__rateplantype.property__addErrorConfig.json", parseAuthorContent);
});
function CountryCodes() {
    console.log("COUNTRY");
    var a;
    for (a = 0; a < countries.length; a++)
        "in" == countries[a].code.toLowerCase().trim()
            ? ($("#countryCode").append('\x3coption value\x3d"' + countries[a].dial_code + '" selected\x3d"selected"\x3e' + countries[a].dial_code + "(" + countries[a].code + ")\x3c/option\x3e"),
              $("#contactusCountryCode").append('\x3coption value\x3d"' + countries[a].dial_code + '" selected\x3d"selected"\x3e' + countries[a].dial_code + "(" + countries[a].code + ")\x3c/option\x3e"),
              $("#individual_signupform_countryCode").append('\x3coption value\x3d"' + countries[a].dial_code + '" selected\x3d"selected"\x3e' + countries[a].dial_code + "(" + countries[a].code + ")\x3c/option\x3e"),
              $("#voMemberCountryCode").append('\x3coption value\x3d"' + countries[a].dial_code + '" selected\x3d"selected"\x3e' + countries[a].dial_code + "(" + countries[a].code + ")\x3c/option\x3e"))
            : ($("#countryCode").append('\x3coption value\x3d"' + countries[a].dial_code + '"\x3e' + countries[a].dial_code + "(" + countries[a].code + ")\x3c/option\x3e"),
              $("#contactusCountryCode").append('\x3coption value\x3d"' + countries[a].dial_code + '"\x3e' + countries[a].dial_code + "(" + countries[a].code + ")\x3c/option\x3e"),
              $("#individual_signupform_countryCode").append('\x3coption value\x3d"' + countries[a].dial_code + '"\x3e' + countries[a].dial_code + "(" + countries[a].code + ")\x3c/option\x3e"),
              $("#voMemberCountryCode").append('\x3coption value\x3d"' + countries[a].dial_code + '"\x3e' + countries[a].dial_code + "(" + countries[a].code + ")\x3c/option\x3e"));
}
$.fn.disableButton = function () {
    $(this).attr("disabled", !0);
};
$.fn.enableButton = function () {
    $(this).removeAttr("disabled");
};
$.fn.emailValidation = function () {
    var a = /^(([a-zA-Z0-9$_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5}){1,25})+([;.](([a-zA-Z0-9_\-\.]+)@{[a-zA-Z0-9_\-\.]+0\.([a-zA-Z]{2,5}){1,25})+)*$/;
    return $(this).val() ? (a.test($(this).val()) ? !0 : !1) : !1;
};
$.fn.isEmpty = function () {
    return 0 < $(this).val().trim().length ? !1 : !0;
};
$.fn.passwordValidation = function () {
    var a = $(this).val();
    if (6 <= a.length) {
        if (15 >= a.length) {
            var b = /[A-Z]+/.test(a),
                c = /[a-z]+/.test(a);
            a = /[0-9]+/.test(a);
            return b && c && a ? "" : UIERRORS.PASSWORD_MATCH;
        }
        return UIERRORS.PASSWORD_MAXIMUM;
    }
    return UIERRORS.PASSWORD_MINIMUM;
};
function getResortData(a) {
    var b = JSON.parse(a.responseText);
    RESORTDATA = [];
    var c = [];
    Object.keys(b).forEach(function (a) {
        "jcr:content" != a.toLowerCase().trim() &&
            void 0 != b[a] &&
            b[a]["jcr:content"] &&
            b[a]["jcr:content"].par &&
            b[a]["jcr:content"].par.resort_overall &&
            b[a]["jcr:content"].par.resort_overall &&
            b[a]["jcr:content"].par.resort_overall.data &&
            b[a]["jcr:content"].par.resort_overall.data.masterName &&
            (RESORTDATA.push({
                value: b[a]["jcr:content"].par.resort_overall.data.masterName,
                resortID: b[a]["jcr:content"].par.resort_overall.data.resortID,
                masterName: b[a]["jcr:content"].par.resort_overall.data.masterName,
                filename: a,
                sfResortID: b[a]["jcr:content"].par.resort_overall.data.sfResortID,
                locationLatitude: b[a]["jcr:content"].par.resort_overall.data.locationLatitude,
                locationLongitude: b[a]["jcr:content"].par.resort_overall.data.locationLongitude,
                region: b[a]["jcr:content"].par.resort_overall.data.byregions,
                byregions: b[a]["jcr:content"].par.resort_overall.data.byregions,
                roomInfo: getOccupancyDetailsArr(b[a]["jcr:content"].par.resort_overall.data.roomInfo),
                resortAmenities: b[a]["jcr:content"].par.resort_overall.data.resortAmenitiesList,
                adress: b[a]["jcr:content"].par.resort_overall.data.address,
            }),
            c.push(a));
    });
    setSessionData("masterNameAndResortId", RESORTDATA);
    setSessionData("rsrtsFileName", c);
    a = !1;
    getSessionData("isFromDestinationOffer") && ((a = getSessionData("isFromDestinationOffer")), deleteSession("isFromDestinationOffer"));
    if (!a) {
        var d = new Bloodhound({
            initialize: !1,
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace("value"),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            identify: function (a) {
                return a.value;
            },
            local: RESORTDATA,
            limit: RESORTDATA.length,
        });
        a = function (a, b) {
            "" === a ? b(d.all()) : d.search(a, b);
        };
        d.initialize();
        $("#in_mice_book.typeahead").typeahead("destroy");
        $("#singleDestination.typeahead").typeahead("destroy");
        $("#multicity.typeahead").typeahead("destroy");
        $("#selectedCircularDestination.typeahead").typeahead("destroy");
        $("#PagesingleDestination.typeahead").typeahead("destroy");
        $("#in_mice_book.typeahead").typeahead(
            { minLength: 0, maxItem: RESORTDATA.length, hint: !1, highlight: !0 },
            {
                name: "states",
                display: "value",
                offset: !1,
                source: a,
                limit: RESORTDATA.length,
                templates: {
                    empty: '\x3cdiv class\x3d"empty-message" id\x3d"empty-message"\x3e\nNo Destination Found\n\x3c/div\x3e',
                    suggestion: Handlebars.compile(
                        '\x3cdiv\x3e\x3cdiv class\x3d"dest-resort"\x3e\x3cstrong\x3e{{destination}}\x3c/strong\x3e \x3cspan\x3e{{value}}\x3c/span\x3e\x3c/div\x3e \x3cdiv class\x3d"type"\x3e{{type}}\x3c/div\x3e\x3c/div\x3e'
                    ),
                },
            }
        );
        $("#singleDestination.typeahead").typeahead(
            { minLength: 0, maxItem: RESORTDATA.length, hint: !1, highlight: !0 },
            {
                name: "states",
                display: "value",
                offset: !1,
                source: a,
                limit: RESORTDATA.length,
                templates: {
                    empty: '\x3cdiv class\x3d"empty-message" id\x3d"empty-message"\x3e\nNo Destination Found\n\x3c/div\x3e',
                    suggestion: Handlebars.compile(
                        '\x3cdiv\x3e\x3cdiv class\x3d"dest-resort"\x3e\x3cstrong\x3e{{destination}}\x3c/strong\x3e \x3cspan\x3e{{value}}\x3c/span\x3e\x3c/div\x3e \x3cdiv class\x3d"type"\x3e{{type}}\x3c/div\x3e\x3c/div\x3e'
                    ),
                },
            }
        );
        $("#PagesingleDestination.typeahead").typeahead(
            { minLength: 0, maxItem: RESORTDATA.length, hint: !1, highlight: !0 },
            {
                name: "states",
                display: "value",
                offset: !1,
                source: a,
                limit: RESORTDATA.length,
                templates: {
                    empty: '\x3cdiv class\x3d"empty-message" id\x3d"empty-message"\x3e\nNo Destination Found\n\x3c/div\x3e',
                    suggestion: Handlebars.compile(
                        '\x3cdiv\x3e\x3cdiv class\x3d"dest-resort"\x3e\x3cstrong\x3e{{destination}}\x3c/strong\x3e \x3cspan\x3e{{value}}\x3c/span\x3e\x3c/div\x3e \x3cdiv class\x3d"type"\x3e{{type}}\x3c/div\x3e\x3c/div\x3e'
                    ),
                },
            }
        );
        $("#selectedCircularDestination.typeahead").typeahead(
            { minLength: 0, maxItem: RESORTDATA.length, hint: !1, highlight: !0 },
            {
                name: "states",
                display: "value",
                offset: !1,
                source: a,
                limit: RESORTDATA.length,
                templates: {
                    empty: '\x3cdiv class\x3d"empty-message" id\x3d"empty-message"\x3e\nNo Destination Found\n\x3c/div\x3e',
                    suggestion: Handlebars.compile(
                        '\x3cdiv\x3e\x3cdiv class\x3d"dest-resort"\x3e\x3cstrong\x3e{{destination}}\x3c/strong\x3e \x3cspan\x3e{{value}}\x3c/span\x3e\x3c/div\x3e \x3cdiv class\x3d"type"\x3e{{type}}\x3c/div\x3e\x3c/div\x3e'
                    ),
                },
            }
        );
    }
    getSessionData("resortSelectedName") &&
        ($("#default-datasets .typeahead").typeahead("val", getSessionData("resortSelectedName")), $("#default-datasets .typeahead").trigger("typeahead:selected", { value: getSessionData("resortSelectedName") }));
}
function parseAuthorContent(a) {
    a = JSON.parse(a.responseText);
    var b = a.uierrorconfig,
        c = a.addErrorConfig;
    for (i in b) {
        var d = JSON.parse(b[i]),
            e = d.uierrorcode;
        d = d.uierrordescription;
        UIERRORS[e] = d;
    }
    b = a.rateplantype;
    for (i in b) (d = JSON.parse(b[i])), (e = d.ratePlanId), (RATEPLANS[e] = d);
    for (i in c) (d = JSON.parse(c[i])), (e = d.errorcode), (d = d.errordescription), (API_ERROR[e] = d);
}
function getData(a, b) {
    $.ajax({
        url: a,
        cache: !0,
        beforeSend: function () {
            return DATA_CACHE.hasOwnProperty(a) && DATA_CACHE[a] ? (b(DATA_CACHE[a]), !1) : !0;
        },
        complete: function (c, d) {
            "success" == d && (DATA_CACHE[a] = c);
            b(c);
        },
    });
}
function postData(a, b, c) {
    c
        ? $.ajax({
              type: "POST",
              url: a,
              dataType: "json",
              contentType: "application/json",
              data: JSON.stringify(c),
              cache: !1,
              success: function (a) {
                  b(a);
              },
          })
        : $.ajax({
              type: "POST",
              url: a,
              cache: !1,
              success: function (a) {
                  b(a);
              },
          });
}
var localCache = {
    data: {},
    remove: function (a) {
        delete localCache.data[a];
    },
    exist: function (a) {
        return localCache.data.hasOwnProperty(a) && null !== localCache.data[a];
    },
    get: function (a) {
        return localCache.data[a];
    },
    set: function (a, b, c) {
        localCache.remove(a);
        localCache.data[a] = b;
        $.isFunction(c) && c(b);
    },
};
function deleteSessionData(a) {
    delete sessionStorage[a];
}
function setSessionData(a, b) {
    "boolean" == typeof b
        ? ((b = JSON.stringify(b)), sessionStorage.setItem(a, SterlEncrypto2017.encode(b)))
        : "" == b || void 0 == b || "undefined" == b
        ? sessionStorage.setItem(a, b)
        : "object" === typeof b || null == b
        ? sessionStorage.setItem(a, SterlEncrypto2017.encode(JSON.stringify(b)))
        : sessionStorage.setItem(a, SterlEncrypto2017.encode(b));
}
function getSessionData(a) {
    var b = sessionStorage.getItem(a);
    if ("" == b || void 0 == b || "undefined" == b) b = sessionStorage.getItem(a);
    else {
        b = SterlEncrypto2017.decode(sessionStorage.getItem(a));
        if ("true" == b) return !0;
        if ("false" == b) return !1;
        if ("null" == b) return null;
        if ("object" !== typeof b && "string" === typeof b)
            try {
                b = JSON.parse(b);
            } catch (c) {
                b = SterlEncrypto2017.decode(sessionStorage.getItem(a));
            }
    }
    return b;
}
var SterlEncrypto2017 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\x3d",
    encode: function (a) {
        var b = "",
            c = 0;
        for (a = SterlEncrypto2017._utf8_encode(a); c < a.length; ) {
            var d = a.charCodeAt(c++);
            var e = a.charCodeAt(c++);
            var f = a.charCodeAt(c++);
            var k = d >> 2;
            d = ((d & 3) << 4) | (e >> 4);
            var h = ((e & 15) << 2) | (f >> 6);
            var g = f & 63;
            isNaN(e) ? (h = g = 64) : isNaN(f) && (g = 64);
            b = b + this._keyStr.charAt(k) + this._keyStr.charAt(d) + this._keyStr.charAt(h) + this._keyStr.charAt(g);
        }
        return b;
    },
    decode: function (a) {
        var b = "",
            c = 0;
        for (a = a.replace(/[^A-Za-z0-9+/=]/g, ""); c < a.length; ) {
            var d = this._keyStr.indexOf(a.charAt(c++));
            var e = this._keyStr.indexOf(a.charAt(c++));
            var f = this._keyStr.indexOf(a.charAt(c++));
            var k = this._keyStr.indexOf(a.charAt(c++));
            d = (d << 2) | (e >> 4);
            e = ((e & 15) << 4) | (f >> 2);
            var h = ((f & 3) << 6) | k;
            b += String.fromCharCode(d);
            64 != f && (b += String.fromCharCode(e));
            64 != k && (b += String.fromCharCode(h));
        }
        return (b = SterlEncrypto2017._utf8_decode(b));
    },
    _utf8_encode: function (a) {
        for (var b = "", c = 0; c < a.length; c++) {
            var d = a.charCodeAt(c);
            128 > d
                ? (b += String.fromCharCode(d))
                : (127 < d && 2048 > d ? (b += String.fromCharCode((d >> 6) | 192)) : ((b += String.fromCharCode((d >> 12) | 224)), (b += String.fromCharCode(((d >> 6) & 63) | 128))), (b += String.fromCharCode((d & 63) | 128)));
        }
        return b;
    },
    _utf8_decode: function (a) {
        var b = "",
            c = 0;
        for (c1 = c2 = 0; c < a.length; ) {
            var d = a.charCodeAt(c);
            128 > d
                ? ((b += String.fromCharCode(d)), c++)
                : 191 < d && 224 > d
                ? ((c2 = a.charCodeAt(c + 1)), (b += String.fromCharCode(((d & 31) << 6) | (c2 & 63))), (c += 2))
                : ((c2 = a.charCodeAt(c + 1)), (c3 = a.charCodeAt(c + 2)), (b += String.fromCharCode(((d & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63))), (c += 3));
        }
        return b;
    },
};
function distance(a, b, c, d, e) {
    a = (Math.PI * a) / 180;
    c = (Math.PI * c) / 180;
    b = Math.sin(a) * Math.sin(c) + Math.cos(a) * Math.cos(c) * Math.cos((Math.PI * (b - d)) / 180);
    b = Math.acos(b);
    b = (180 * b) / Math.PI;
    b *= 69.09;
    "K" == e && (b *= 1.609344);
    "N" == e && (b *= 0.8684);
    return b;
}
function getAlternateResorts(a) {
    var b = [],
        c = [];
    $.each(RESORTDATA, function (b, e) {
        e.resortID != a.resortID && e.region == a.region && ((b = distance(a.locationLatitude, a.locationLongitude, e.locationLatitude, e.locationLongitude)), 0 < b && c.push({ ResortID: e.resortID, distance: b }));
    });
    c.sort(function (a, b) {
        return new Date(a.distance) - new Date(b.distance);
    });
    $.each(c, function (a, c) {
        b.push(c.ResortID);
    });
    return b.join(",");
}
function getValidOffers() {
    url = "/bin/nodeutil.content__sterlingholidays__promos.property__content.json";
    getData(url, parseValidOfers);
}
function parseValidOfers(a) {
    var b = JSON.parse(a.responseText);
    Object.keys(b).forEach(function (a) {
        VALIDOFFERS.push(JSON.parse(b[a].content));
    });
}
function currentDateGreaterCheckValidation(a) {
    var b = new Date(a);
    a = Date.parse(new Date());
    b = Date.parse(b);
    return a < b ? !0 : !1;
}
function dateBetweenCheckValidation(a, b, c) {
    c = new Date(c);
    a = new Date(a);
    b = Date.parse(new Date(b));
    c = Date.parse(c);
    a = Date.parse(a);
    return a <= c && a >= b ? !0 : !1;
}
function isDuplicateOffer(a) {
    for (var b = !1, c = 0; c < VALIDOFFERS.length; c++)
        if (VALIDOFFERS[c].promoCode == a) {
            b = !0;
            break;
        }
    return b;
}
function getAdminList() {
    getData("/bin/nodeutil.content__sterlingholidays__adminsetting__voadmin.property__content.json", function (a) {
        200 == a.status && a.responseJSON && setSessionData("AdminContentData", a.responseJSON);
    });
}
$(document).ready(function () {
    var a = "Individual";
    $(document).on("click", "input[name\x3d'Enquiring']", function () {
        a = $("input[name\x3d'Enquiring']:checked").val();
    });
    $(document).on("click", "#miceForm", function () {
        if (validationBookAnEventForm("validateAll", a)) {
            var b = {},
                c = {},
                d = {},
                e = {};
            if ("Corporate" == a || "Agent" == a) (e.department = "Sales"), (e.name = "Corporate" == a ? $("#Companyname").val() : $("#travelAgency").val()), (c.companyDetails = e);
            d.city = $("#miceCityIdInBook").val();
            d.country = $("#miceCountryIdInBook").val();
            d.countryCode = getcountryCode($("#miceCountryIdInBook").val());
            d.postalCode = $("#micePinIdInBook").val();
            d.state = $("#miceStateIdInBook").val();
            d.street = $("#miceAddressIdInBook").val();
            c.addressDetails = d;
            c.contactType = a;
            c.emailId = $("#guest1-email_mice_book").val();
            c.salutation = "";
            c.firstName = $("#guest1-fname_mice_book").val();
            c.lastName = $("#guest1-lname_mice_book").val();
            c.mobileNo = $("#guest1-mobile_mice_book").val();
            b.contactDetails = c;
            b.checkInDate = $.datepicker.formatDate("yy-mm-dd", new Date());
            b.checkOutDate = $.datepicker.formatDate("yy-mm-dd", new Date());
            b.eventType = $("#selected-event-enquiry_mice1").text();
            b.remarks = $("#MiceRemarks_mice").val();
            b.resortId = $("#in_mice_book").val();
            b.seatingType = "test";
            b.totalG_rooms = $("#guest_countin1_mice_hsd").val();
            b.totalRooms = 1;
            postData(
                GlobalConstants.DOMAIN_URL + "/mice/register",
                function (a) {
                    "success" == a.status ? (clearMiceForm(), $("#bookingWidget").modal("hide"), display("SUC0008")) : display({ type: "ERROR", header: "Error", message: API_ERROR[a.responseJSON.apiError] });
                },
                b
            );
        }
    });
    $("#selected-event-enquiry_mice1").blur(function () {
        validationBookAnEventForm("TypOfEvent");
    });
    $("#in_mice_book").blur(function () {
        validationBookAnEventForm("destination");
    });
    $("#guest_countin1_mice_hsd").blur(function () {
        validationBookAnEventForm("attendees");
    });
    $("#MiceRemarks_mice").blur(function () {
        validationBookAnEventForm("miceRemarks");
    });
    $("#guest1-fname_mice_book").blur(function () {
        validationBookAnEventForm("fname_mice_book");
    });
    $("#guest1-lname_mice_book").blur(function () {
        validationBookAnEventForm("lname_mice_book");
    });
    $("#guest1-email_mice_book").blur(function () {
        validationBookAnEventForm("email_mice_book");
    });
    $("#guest1-mobile_mice_book").blur(function () {
        validationBookAnEventForm("mobile_mice_book");
    });
    $("#miceCountryIdInBook").blur(function () {
        validationBookAnEventForm("country");
    });
    $("#miceStateIdInBook").blur(function () {
        validationBookAnEventForm("state");
    });
    $("#miceCityIdInBook").blur(function () {
        validationBookAnEventForm("city");
    });
    $("#miceAddressIdInBook").blur(function () {
        validationBookAnEventForm("address");
    });
    $("#micePinIdInBook").blur(function () {
        validationBookAnEventForm("picCode");
    });
    $("#Companyname").blur(function () {
        validationBookAnEventForm("corporate");
    });
    $("#travelAgency").blur(function () {
        validationBookAnEventForm("agent");
    });
});
function validationBookAnEventForm(a, b) {
    var c = !0;
    if ("validateAll" == a || "TypOfEvent" == a) "Type of event" == $("#selected-event-enquiry_mice1").text() ? ($("#selectedTypesError").html(UIERRORS.SELECTED_EVENT_TYPE_ERROR), (c = !1)) : $("#selectedTypesError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "destination" == a) $("#in_mice_book").isEmpty() ? ($("#DestinationError").html(UIERRORS.DESTINATION_ERROR), (c = !1)) : $("#DestinationError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "attendees" == a) $("#guest_countin1_mice_hsd").isEmpty() ? ($("#AttendeesError").html(UIERRORS.ATTENDEES_ERROR), (c = !1)) : $("#AttendeesError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "miceRemarks" == a) $("#MiceRemarks_mice").isEmpty() ? ($("#AdditionalremarksError").html(UIERRORS.ADDITIONAL_REMARKS), (c = !1)) : $("#AdditionalremarksError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "fname_mice_book" == a) $("#guest1-fname_mice_book").isEmpty() ? ($("#guest1-fname_mice_book_error").html(UIERRORS.FIRST_NAME_REQUIRED), (c = !1)) : $("#guest1-fname_mice_book_error").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "lname_mice_book" == a) $("#guest1-lname_mice_book").isEmpty() ? ($("#LastnameError").html(UIERRORS.LAST_NAME_REQUIRED), (c = !1)) : $("#LastnameError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "email_mice_book" == a)
        $("#guest1-email_mice_book").isEmpty()
            ? ($("#EmailError").html(UIERRORS.EMAIL_REQUIRED), (c = !1))
            : validateEmail($("#guest1-email_mice_book").val())
            ? $("#EmailError").html(UIERRORS.EMPTY)
            : ($("#EmailError").html(UIERRORS.EMAIL_INVALID), (c = !1));
    if ("validateAll" == a || "mobile_mice_book" == a)
        $("#guest1-mobile_mice_book").isEmpty()
            ? ($("#MobileError").html(UIERRORS.MOBILE_REQUIRED), (c = !1))
            : validateNumeric($("#guest1-mobile_mice_book").val())
            ? validatePhoneLength($("#guest1-mobile_mice_book").val())
                ? $("#MobileError").html(UIERRORS.EMPTY)
                : ($("#MobileError").html(UIERRORS.MOBILE_MINIMUM), (c = !1))
            : ($("#MobileError").html(UIERRORS.MOBILE_NUMBER), (c = !1));
    if ("validateAll" == a || "country" == a) $("#miceCountryIdInBook").isEmpty() ? ($("#miceCountryError").html(UIERRORS.COUNTRY_REQUIRED), (c = !1)) : $("#miceCountryError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "state" == a)
        "IND" == $("#miceCountryIdInBook").val() ? ($("#miceStateIdInBook").isEmpty() ? ($("#miceStateError").html(UIERRORS.STATE_REQUIRED), (c = !1)) : $("#miceStateError").html(UIERRORS.EMPTY)) : $("#miceStateError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "city" == a)
        "IND" == $("#miceCountryIdInBook").val() ? ($("#miceCityIdInBook").isEmpty() ? ($("#miceCityError").html(UIERRORS.CITY_REQUIRED), (c = !1)) : $("#miceCityError").html(UIERRORS.EMPTY)) : $("#miceCityError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "address" == a) $("#miceAddressIdInBook").isEmpty() ? ($("#miceAddressError").html(UIERRORS.ADDRESS_LINE1_REQUIRED), (c = !1)) : $("#miceAddressError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "picCode" == a)
        $("#micePinIdInBook").isEmpty()
            ? ($("#micePinError").html(UIERRORS.PINCODE_REQUIRED), (c = !1))
            : validateNumeric($("#micePinIdInBook").val())
            ? $("#micePinError").html(UIERRORS.EMPTY)
            : ($("#micePinError").html(UIERRORS.PINCODE_NUMBERS), (c = !1));
    "Corporate" != b || ("validateAll" != a && "corporate" != a) || ($("#Companyname").isEmpty() ? ($("#CompanynameError").html(UIERRORS.COMPANY_REQUIRED), (c = !1)) : $("#CompanynameError").html(UIERRORS.EMPTY));
    "Agent" != b || ("validateAll" != a && "agent" != a) || ($("#travelAgency").isEmpty() ? ($("#AgencynameError").html(UIERRORS.AGENCY_REQUIRED), (c = !1)) : $("#AgencynameError").html(UIERRORS.EMPTY));
    c ? $("#miceForm").enableButton() : $("#miceForm").disableButton();
    return c;
}
function validateEmail(a) {
    return /^([a-zA-Z0-9_.+-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(a);
}
function validateNumeric(a) {
    return /^[0-9]+$/.test(a);
}
function validatePhoneLength(a) {
    return 10 == a.length ? !0 : !1;
}
$("#guest1-mobile_mice_book").keypress(function (a) {
    a = a.keyCode || a.which;
    $("#MobileError").html("");
    (a = /^[0-9]+$/.test(String.fromCharCode(a))) || $("#MobileError").html("Only Alphabets and Numbers allowed.");
    return a;
});
function getcountryCode(a) {
    var b = countries.filter(function (b) {
        if (b.name == a) return b;
    });
    if ($.isArray(b)) return b[0].dial_code;
}
function clearMiceForm() {
    $("#in_mice_book").val("");
    $("#guest_countin1_mice_hsd").val("");
    $("#MiceRemarks_mice").val("");
    $("#guest1-fname_mice_book").val("");
    $("#guest1-lname_mice_book").val("");
    $("#guest1-email_mice_book").val("");
    $("#guest1-mobile_mice_book").val("");
    $("#miceCountryIdInBook").val("");
    $("#miceStateIdInBook").val("");
    $("#miceCityIdInBook").val("");
    $("#miceAddressIdInBook").val("");
    $("#micePinIdInBook").val("");
}
$(document).ready(function () {
    $(document).on("click", "#terms1", function () {
        1 == $(this).prop("checked") ? $("#contactusSubmitBtn").enableButton() : 0 == $(this).prop("checked") && $("#contactusSubmitBtn").disableButton();
    });
    $(document).on("click", "#contactusSubmitBtn", function () {
        if (validationContactUsForm("validateAll")) {
            $("#contactusSubmitBtn").disableButton();
            var a = {};
            a.bookedTime = $.datepicker.formatDate("yy-mm-dd", new Date());
            a.comments = $("#contactusContactComments").val();
            a.emailId = $("#contactusEmailContact").val();
            a.firstName = $("#contactusUserName").val();
            a.lastName = $("#contactusLastName").val();
            a.memberId = "";
            a.mobileNo = $("#contactusMobileNum").val();
            a.nonMemberId = "";
            a.personCount = $("#contactusNo-of-rooms").val();
            a.roomCount = $("#contactusNo-of-people").val();
            a.termCondFlag = !0;
            a.userType = "VO";
            postData(
                GlobalConstants.DOMAIN_URL + "/hsdGroupBooking",
                function (a) {
                    "success" == a.status
                        ? ($("#contactUsForm").modal("hide"), display({ type: "SUCCESS", header: "Thank You", message: UIERRORS.GROUP_BOOKING_SUCCESS }))
                        : display({ type: "ERROR", header: "Error", message: API_ERROR[a.responseJSON.apiError] });
                },
                a
            );
        }
    });
});
function validationContactUsForm(a) {
    var b = !0;
    if ("validateAll" == a || "userFName" == a) $("#contactusUserName").isEmpty() ? ($("#contactFirstNameError").html(UIERRORS.FIRST_NAME_REQUIRED), (b = !1)) : $("#contactFirstNameError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "userLName" == a) $("#contactusLastName").isEmpty() ? ($("#contactLastNameError").html(UIERRORS.LAST_NAME_REQUIRED), (b = !1)) : $("#contactLastNameError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "email" == a)
        $("#contactusEmailContact").isEmpty()
            ? ($("#contactEmailError").html(UIERRORS.EMAIL_REQUIRED), (b = !1))
            : validateEmail($("#contactusEmailContact").val())
            ? $("#contactEmailError").html(UIERRORS.EMPTY)
            : ($("#contactEmailError").html(UIERRORS.EMAIL_INVALID), (b = !1));
    if ("validateAll" == a || "mobile" == a)
        $("#contactusMobileNum").isEmpty()
            ? ($("#contactMobileError").html(UIERRORS.MOBILE_REQUIRED), (b = !1))
            : validateNumeric($("#contactusMobileNum").val())
            ? validatePhoneLength($("#contactusMobileNum").val())
                ? $("#contactMobileError").html(UIERRORS.EMPTY)
                : ($("#contactMobileError").html(UIERRORS.MOBILE_MINIMUM), (b = !1))
            : ($("#contactMobileError").html(UIERRORS.MOBILE_NUMBER), (b = !1));
    if ("validateAll" == a || "no_of_room" == a) $("#contactusNo-of-rooms").isEmpty() ? ($("#contactRoomError").html("No.of room Required"), (b = !1)) : $("#contactRoomError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "no_of_people" == a) $("#contactusNo-of-people").isEmpty() ? ($("#contactPeopleError").html("No.of people Required"), (b = !1)) : $("#contactPeopleError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "comment" == a) $("#contactusContactComments").isEmpty() ? ($("#contactCommentsError").html(UIERRORS.COMMENTS), (b = !1)) : $("#contactCommentsError").html(UIERRORS.EMPTY);
    return b;
}
var htmlExtension = ".html",
    contentUrlPath = "/content/sterlingholidays/en/index",
    contentUrlIndexPath = contentUrlPath + htmlExtension,
    tempLoc = window.location.href,
    isProdAuthor = -1 < tempLoc.indexOf("prod-author") || -1 < tempLoc.indexOf("prod-new-author"),
    isProdPublisher = -1 < tempLoc.indexOf("prod-publisher") || -1 < tempLoc.indexOf("prod-new-publisher"),
    isProdDispatcherHost = -1 < tempLoc.indexOf("www.sterlingholidays.com") || -1 < tempLoc.indexOf("beta.sterlingholidays.com"),
    isProdDispatcherElb = -1 < tempLoc.indexOf("prod-dispatcher") || -1 < tempLoc.indexOf("prod-new-dispatcher"),
    isStageAuthor = -1 < tempLoc.indexOf("stagging-author"),
    isStagePublisher = -1 < tempLoc.indexOf("staging-publisher"),
    isStageDispatcherHost = -1 < tempLoc.indexOf("travelrati.in"),
    isStageDispatcherElb = -1 < tempLoc.indexOf("sit-dispatcher"),
    isPreProdAuthor = -1 < tempLoc.indexOf("beta-author"),
    isPreProdPublisher = -1 < tempLoc.indexOf("beta-publisher"),
    isPreProdDispatcherHost = -1 < tempLoc.indexOf("beta.sterlingholidays.com"),
    isPreProdDispatcherElb = -1 < tempLoc.indexOf("beta-dispatcher"),
    isUatAuthor = -1 < tempLoc.indexOf("aem-author"),
    isUatPublisher = -1 < tempLoc.indexOf("aem-publisher"),
    isUatDispatcherHost = -1 < tempLoc.indexOf("https://holidayzone.biz"),
    isUatDispatcherElb = -1 < tempLoc.indexOf("staging-dispatcher"),
    domainBaseUrl = "https://api.holidayzone.biz";
(isStageDispatcherHost || isUatDispatcherHost || isProdDispatcherHost || isPreProdDispatcherHost) && -1 == tempLoc.indexOf("/content/") && ((contentUrlPath = htmlExtension = ""), (contentUrlIndexPath = "/"));
if (isProdAuthor || isProdPublisher || isProdDispatcherHost || isProdDispatcherElb) (isProdEnv = !0), (domainBaseUrl = "https://beta-api.sterlingholidays.com");
if (isStageAuthor || isStagePublisher || isStageDispatcherHost || isStageDispatcherElb) domainBaseUrl = "https://api.travelrati.in";
if (isUatAuthor || isUatPublisher || isUatDispatcherHost || isUatDispatcherElb) domainBaseUrl = "https://api.holidayzone.biz";
var GlobalConstants = {
        DOMAIN_URL: domainBaseUrl,
        IMAGE_BASE64_PRETEXT: "data:image/png;base64,",
        GET_RAW_RESPONSE: "RAW_RESPONSE",
        GET_TARGET_RESPONSE: "TARGET_RESPONSE",
        TITLE: "Mr. Ms. Mrs. Dr. Prof. Miss Sir Rev Major Gen Capt".split(" "),
        GENDER: ["Male", "Female"],
        MARITIAL_STATUS: ["Single", "Married"],
        RELATION: ["Father", "Mother", "Spouse", "Son", "Daughter"],
        MICE_TITLE: [
            { key: "Mr.", value: "Mr." },
            { key: "Mrs.", value: "Mrs." },
            { key: "Miss", value: "Miss" },
            { key: "Dr.", value: "Dr." },
            { key: "Ms.", value: "Ms." },
            { key: "Prof.", value: "Prof." },
        ],
        URL: {
            HSD: {
                HSD_REGISTER_INDIVIDUAL_GET_OTP: "/otp/sendOTP",
                HSD_REGISTER_INDIVIDUAL: "/hsdUser/register",
                HSD_CIRCULAR_REGISTER_INDIVIDUAL: "/hsdUser/circularRegister",
                GET_USER: "/users/getUser",
                GET_CUSTOMER_DETAILS: "/hsd/getCustomerDetails",
                UPDATE_CUSTOMER_DETAILS: "/hsd/updateCustomerDetails",
                RESET_PSWD: "/hsdUser/resetPwd",
                FORGOT_PSWD: "/hsdUser/forgotPwd",
                HSD_FORGET_PSWD_WITHOTP: "/otp/sendOTP",
                GET_DASHBOARD_ACCOUNT_DETAILS: "/hsdDashboard/dashboardGetAccountDetails",
                REGISTER: "/users/register",
                UPDATE: "/users/updateUser",
                INITIATE_CANCEL_BOOKING: "/otp/sendOTP",
                CANCEL_BOOKING: "/hsd/booking/cancelBooking",
                CANCEL_CIRCUIT_BOOKING: "/hsd/booking/cancelCircuitBooking",
                GETROOMS_AVAILABILITY: domainBaseUrl + "/hsd/booking/checkAvail",
                CREATE_BOOKING: domainBaseUrl + "/hsd/booking/createBooking",
                GET_BOOKING_BY_USER: "/hsd/booking/get/ByUser",
                GET_BOOKING_BY_ID: "/hsd/booking/get/Id",
                SEND_BOOKING_EMAIL: "/hsd/booking/sendEmail",
                UPDATE_BOOKING_PAYMENT: "/hsd/booking/updatePayment",
                DOWNLOAD_CV: "/hsd/booking/{id}",
                CREATE_EXPERIENCE_RATING: "/hsdExperience",
                CREATE_FEEDBACK: "/hsdFeedbackQuery",
                CREATE_GROUP_BOOKING: "/hsdGroupBooking",
                CREATE_ROOM: "/hsd/resortRoomMaster/createResortRoom",
                DELETE_ROOM: "/hsd/resortRoomMaster/deleteResortRoom",
                GET_RATE_PLANS: "/hsd/resortRoomMaster/getRatePlans",
                GET_ROOM_BY_ID: "/hsd/resortRoomMaster/getResortRoomById",
                UPDATE_ROOM: "/hsd/resortRoomMaster/updateResortRoom",
                FORGOT_PASSWORD: "/user/password/forgot",
                VERIFY_FORGOT_LINK: "/user/password/{token}",
                CHANGE_PASSWORD: "/user/password/{token}",
                GET_RESORT_RATE_PLANS: "/rateplan/getRates",
                FEEDBACK_AND_QUERIES: "/hsdFeedbackQuery",
                SUMMARY_GET_USER: domainBaseUrl + "/users/getUser",
                SUMMARY_CHK_AVAILABILITY: domainBaseUrl + "/hsd/booking/checkAvail",
                SUMMARY_CREATE_BOOKING: domainBaseUrl + "/hsd/booking/create",
                SUMMARY_CREATE_CIRCUIT_BOOKING: domainBaseUrl + "/hsd/booking/createcircuit",
                MAXIMOJO: {
                    GET_HOTEL_AVAILABILITY: "/OTA_HotelAvailGetRQ",
                    UPDATE_HOTEL_AVAILABILITY: "/OTA_HotelAvailNotifRQ",
                    UPDATE_HOTEL_RATE_AMOUNT: "/OTA_HotelAvailNotifRQ",
                    GET_ROOM_RATE_PLANS: "/OTA_HotelRatePlanRQ",
                    GET_ROOM_RATE_PLANS_TO_FETCH_RATES: "/OTA_HotelRatePlanRQ_ToFetchRates",
                    GET_BOOKING: "/OTA_HotelResNotifRQ",
                },
                SUBMIT_FEEDBACK: "/common/feedback",
                GET_ENHANCEMENTS: "/bin/nodeutil.content__sterlingholidays__enhancement.property__content.json",
                GET_SEPCIAL_MANDATORY_OFFER: "/bin/nodeutil.content__sterlingholidays__specialmandatoryoffer.property__content.json",
                GET_RANDOM_COUPON_API_URL: "/hsdAdmin/checkRandomCouponByCouponCode",
                GET_RANDOM_COUPON_DETAILS_URL: "/bin/getrandomcoupondata",
                RATE_A_HOLIDAY: "/hsd/booking/rateAHoliday",
                VALIDATE_BOOKING_DETAILS: domainBaseUrl + "/hsd/booking/validateBookingDetails",
                VALIDATE_CORPORATE_CODE: domainBaseUrl + "/hsd/corporate-code/is-valid",
                CHECK_CIRCULAR_AVAILABILITY: domainBaseUrl + "/hsd/booking/checkCircularAvail",
                GET_VALID_PROMOS: "/bin/getvalidpromosdetails",
            },
            VO: {
                GET_CUSTOMER_DETAILS: "/vo/getCustomerDetails",
                GET_DASHBOARD_ACCOUNT_DETAILS: "/voDashboard/getDashboardAccountDetails",
                UPDATE_CUSTOMER_DETAILS: "/vo/updateCustomerDetails",
                UPDATE_CUSTOMER_PREF_DETAILS: "/vo/updateCustomerPreference",
                GETROOMS_AVAILABILITY: "/vo/getAvailability",
                GETSEASON_CALENDAR_AVAILABILITY: "/vo/seasonDetails",
                CREATE_LEAD: "/vo/createLead",
                GET_ASF_EMI_PDF: "/vo/overdue/",
                CAPTURE_KYC: "/vo/capture/kyc",
                PAY_EMI: "/vo/payEMI",
                PAY_ASF: "/vo/payASF",
                PAY_PRECLOSURE_EMI: "/vo/payPreclosureEMI",
                PAY_FUTURE_ASF: "/vo/payFutureASF",
                ADD_DEPENDENT: "/vo/addDependent",
                SUBMIT_FEEDBACK: "/vo/feedback",
                SEASON_CALENDER: "/vo/seasonCalender",
                CAPTURE_DOWNPAYMENT: "/voProduct/captureDownPayment",
                CAPTURE_PRODUCT_PMNT_PLAN: "/voProduct/captureProductPmntPlan",
                DTC: "/dtc/summary",
                GET_PRODUCTS: "/voProduct/getProducts",
                FORGET_PSWD: "/vo/forgotPwd",
                RESET_PSWD: "/vo/resetPwd",
                VO_FORGET_PSWD_WITHOTP: "/otp/sendOTP",
                CONF_BOOKING: "/vo/confirmBooking",
                GET_BOOKING: "/vo/booking/getByContractId",
                INITIATE_CANCEL_BOOKING: "/otp/sendOTP",
                CANCEL_BOOKING: "/vo/cancelBooking",
                CANCEL_CIRCUIT_BOOKING: "/vo/cancelCircuitBooking",
                UPDATE_PAYMENT: "/vo/updatePayment",
                ESSENTIALS_TO_CARRY: "/voDashboard/essentialsToCarry",
                RATE_A_HOLIDAY: "/vo/rateAHoliday",
                WELCOME_OFFER: domainBaseUrl + "/vo/welcomeOffer",
                SUBMIT_KYC_URL: domainBaseUrl + "/voProduct/capture/kyc",
                SUBMIT_DOWN_PAYMENT_URL: domainBaseUrl + "/voProduct/captureDownPayment",
                GET_PRODUCT_PAYMENT_PLAN_URL: domainBaseUrl + "/voProduct/getProductPaymentPlan",
                PURCHASE_PAY_DP_URL: domainBaseUrl + "/vo/payDP",
                PURCHASE_GET_PRODUCTS_URL: domainBaseUrl + "/voProduct/getProducts",
                PURCHASE_SUBMIT_PAYMENT_OPTION_URL: domainBaseUrl + "/voProduct/captureProductPmntPlan",
                UPDATE_CAPTURE_PRODUCT_PMNT_PLAN: domainBaseUrl + "/voProduct/updateProductPmntPlan",
                PURCHASE_UPDATE_LEAD_URL: domainBaseUrl + "/vo/updateLead",
                PURCHASE_CREATE_LEAD_URL: domainBaseUrl + "/vo/createLead",
                PURCHASE_SEND_LEAD_OTP_URL: domainBaseUrl + "/otp/sendOTP",
                PURCHASE_VALIDATE_LEAD_OTP_URL: domainBaseUrl + "/otp/validateLeadRegOTP",
                LANDING_GET_PRODUCTS_URL: domainBaseUrl + "/voProduct/getProducts",
                REFER_A_FRIEND_URL: domainBaseUrl + "/voDashboard/referAFriend",
                VO_USER_OTP: domainBaseUrl + "/otp/sendOTP",
                GET_UNIT_PRODUCT_POINT_MATRIX: domainBaseUrl + "/voProduct/get/unitProductPointMatrix",
                BLOCK_BOOKING: "/vo/blockBooking",
                GET_OFFER_URL: domainBaseUrl + "/voProduct/getOffer",
                SF_OFFERS: "/vo/getOffersByContract",
                HAS_MULTI_BOOKING_SAME_DATE: "/vo/has-multiple-booking-on-same-date",
                BOGO_LAPSED_OFFERS_BY_PRODUCT: "/vo/bogo/offer/for/product",
                BOGO_LAPSED_OFFERS_DETAILS: "/vo/bogo/offer/details",
                UPDATE_OFFLINE_BOOKING: "/vo/booking/update/",
                GUEST_FEE_DETAIL: "/vo/guestFee",
                BANNER_IMAGE_CASE: "/vo/createCaseForBannerImage",
                PTS_TC_STATUS: "/vo/tcStatus",
                PTS_BOOKING_REQ: "/vo/ptsBookingReq",
                GET_PTS_EXCHANGE_FEE_DETAILS: "/vo/getPTSExchangeFeeDetails",
                VERIFY_MEMBER_OTP: domainBaseUrl + "/otp/verifyMemberOTP",
            },
            ADMIN: {
                GET_GLOBAL_ADMIN_URL: "/bin/nodeutil.content__sterlingholidays__adminsetting__admin.property__content.json",
                GET_PACKAGE_URL: "/bin/nodeutil.content__sterlingholidays__packages.property__content.json",
                GET_PROPERTIES_URL: "/bin/nodeutil.content__sterlingholidays__adminsetting__admin.property__content.json",
                GET_RESORTS_URL: "/bin/nodeutil.content__sterlingholidays__en__index__resorts-hotels.method__getchild.json",
                GET_PROMOS_URL: "/bin/nodeutil.content__sterlingholidays__promos.property__content.json",
                GET_RATE_PLANS_URL: "/bin/nodeutil.content__sterlingholidays__en__index__main-authoring-dialog__jcr-content__par__author_dialog.property__rateplantype.json",
                GET_ENHANCEMENT_URL: "/bin/nodeutil.content__sterlingholidays__enhancement.property__content.json",
                GET_ROOM_UPGRADE_URL: "/bin/nodeutil.content__sterlingholidays__roomupgrade.property__content.json",
                POST_ENHANCEMENT_PAGE_CONTENT_URL: "/bin/enhancement",
                POST_PROMO_PAGE_CONTENT_URL: "/bin/promo",
                POST_ROOM_UPGRADE_CONTENT_URL: "/bin/roomupgrade",
                POST_PROMO_SETTING_CONTENT_URL: "/bin/admin",
                GET_GLOBAL_VO_ADMIN_URL: "/bin/nodeutil.content__sterlingholidays__adminsetting__voadmin.property__content.json",
                GET_GLOBAL_ADMIN_SETTING: "/bin/nodeutil.content__sterlingholidays__adminsetting__admin.property__content.json",
                GET_PUBLIC_PACKAGE_LIST: "/bin/nodeutil.content__sterlingholidays__packages.property__content.json",
                GET_HOLIDAY_DATES_DEFINTION: "/bin/nodeutil.content__sterlingholidays__holidaydates.property__content.json",
                GET_GLOBAL_VO_EMI_OFFER_URL: "/bin/nodeutil.content__sterlingholidays__adminsetting__emiofferadmin.property__content.json",
            },
            AEM: {
                POST_PACKAGE_DETAILS: "/bin/package",
                POST_PROMO: "/bin/promo",
                POST_PROMO_SETTINGS: "/bin/manipulatenode",
                GET_EXPERIENCE_URL: "/bin/nodeutil.content__sterlingholidays__en__index__jcr-content__par__sterlingexperienceca.json",
            },
            VENUE: {
                VENUE_COUPON_CODE: domainBaseUrl + "/venue/getVenueOffer",
                VENUE_COUPON_SEND_OTP: domainBaseUrl + "/otp/sendOTP",
                VENUE_COUPON_CHECK_OTP: domainBaseUrl + "/venue/venueOtp",
                VENUE_COUPON_CHECK_AVAILABILITY: domainBaseUrl + "/venue/venueCheckAvailability",
                VENUE_COUPON_CONF_BOOKING: "/venue/venueOtherBookingRequest",
                VENUE_COUPON_CANCEL_BOOKING: "/venue/venueOtherBookingRequestCancel",
                VENUE_COUPON_GET_OBR_DETAILS: "/venue/venueGetOBRDetailsByCounponAndCVNumber",
                VENUE_COUPON_REGISTER_USER: "/venue/venueRegisterUser",
                VENUE_COUPON_GET_CVNUMBER_USER: "/venue/venueGetCVNumberByCounponCodeOrORBId",
            },
            LOGIN: "/login",
            LOGIN_SOCIAL: "/sociallogin",
            LOGOUT: "/logout",
            INSTAGRAM: "https://api.instagram.com/v1/users/1754371426/media/recent/?access_token\x3d1754371426.1677ed0.11f9a45cb73a423a8909b0f7d221f1b5",
            STERLING_INSTAGRAM_PAGE: "https://www.instagram.com/sterlingholidays/",
            PWD_FORGOT_EMAIL: "/user/password/forgot?email\x3d",
            IMAGE_UPLOAD_URL: domainBaseUrl + "/common/uploadEncodedFiles",
            PROFILE_IMAGE_UPLOAD_URL: domainBaseUrl + "/common/profileImage/uploadEncodedFiles",
            PDF_UPLOAD_URL: domainBaseUrl + "/common/uploadFile",
            DTC_DOWNLOAD_URL: domainBaseUrl + "/dtc/getDTCPdf",
        },
        MONTH: "January February March April May June July August September October November December".split(" "),
        CITIES: "Ambaji;Ayodhya;Abids;Agra;Ahmedabad;Ahmednagar;Alappuzha;Allahabad;Alwar;Akola;Alibag;Almora;Amlapuram;Amravati;Amritsar;Anand;Anandpur Sahib;Angul;Anna Salai;Arambagh;Asansol;Ajmer;Amreli;Aizawl;Agartala;Aligarh;Auli;Azamgarh;Aurangabad;Baran;Bettiah;Badaun;Badrinath;Balasore;Banaswara;Bankura;Ballia;Bardhaman;Baripada;Barrackpore;Barnala;Barwani;Beed;Beawar;Bellary;Bhadohi;Bhadrak;Bharuch;Bhilai;Bhilwara;Bhiwani;Bidar;Bilaspur;Bangalore;Bhind;Bhagalpur;Bharatpur;Bhavnagar;Bhopal;Bhubaneshwar;Bhuj;Bilimora;Bijapur;Bikaner;Bodh Gaya;Bokaro;Bundi;Barasat;Bareilly;Basti;Bijnor;Burhanpur;Buxur;Calangute;Chandigarh;Chamba;Chandausi;Chandauli;Chandrapur;Chhapra;Chidambaram;Chiplun;Chhindwara;Chitradurga;Chittoor;Cooch Behar;Chennai;Chittaurgarh;Churu;Coimbatore;Cuddapah;Cuttack;Dahod;Dalhousie;Davangere;Dehri;Dewas;Dwarka;Dehradun;Delhi;Deoria;Dhanbad;Dharamshala;Dispur;Dholpur;Diu Island;Durgapur;Didwana;Ernakulam;Etah;Etawah;Erode;Faridabad;Ferozpur;Faizabad;Gandhinagar;Gangapur;Garia\t;Gaya;Ghaziabad;Godhra\t;Gokul;Gonda;Gorakhpur;Greater Mumbai;Gulbarga;Guna;Guntur;Gurgaon;Greater Noida;Gulmarg;Hanumangarh;Haflong;Haldia;Haridwar;Hajipur;Haldwani;Hampi;Hapur;Hubli;Hardoi;Hyderabad;Guwahati;Gangtok;Gwalior;Imphal;Indore;Itanagar;Itarsi;Jabalpur;Jagadhri;Jalna;Jamalpur;Jhajjar;Jhalawar;Jaipur;Jaisalmer;Jalandhar;Jammu;Jamshedpur;Jhansi;Jaunpur;Jodhpur;Junagadh;Jalore;Kishanganj;Katihar;Kanpur;Kangra;Kasauli;Kapurthala;Kanchipuram;Karnal;Karaikudi;Kanyakumari;Katni;Khajuraho;Khandala;Khandwa;khargone;Kishangarh\t;Kochi;Kodaikanal;Kohima;Kolhapur;Kolkata;Kollam;Kota;Kottayam;Kovalam;Kozhikode;Kumbakonam;Kumarakom;Kurukshetra;Lalitpur;Latur;Lucknow;Ludhiana;Lavasa;Leh;Laxmangarh;Madikeri;Madurai;Mahabaleshwar;Mahabalipuram;Mahbubnagar;Manali;Mandu Fort;Mangalore;Malegaon;Manipal;Margoa;Mathura;Meerut;Mirzapur;Mohali;Morena;Motihari;Moradabad;Mount Abu;Mumbai;Munger;Munnar;Mussoorie;Mysore;Muzaffarnagar;Mokokchung;Muktsar;Nagpur;Nagaon;Nagercoil;Naharlagun;Naihati;Nainital;Nalgonda;Namakkal;Nanded;Narnaul;Nasik;Nathdwara;Navsari;Neemuch;Noida;Ooty;Orchha;Palakkad;Palanpur;Pali;Palwal;Panaji;Panipat;Panvel;Pathanamthitta;Pandharpur;Patna Sahib;Panchkula;Patna;Periyar;Phagwara;Pilibhit;Pinjaur;Pollachi;Pondicherry;Ponnani;Porbandar;Port Blair;Porur;Pudukkottai;Punalur;Pune;Puri;Purnia;Pushkar;Patiala;Raxual;Rajkot;Rameswaram;Rajahmundry;Ranchi;Ratlam;Raipur;Rewa;Rewari;Rishikesh;Rourkela;Sitamrahi;Sagar;Sangareddy;Saharanpur;Salem;Salt Lake;Samastipur;Sambalpur;Sambhal;Sanchi;Sangli;Sarnath;Sasaram;Satara;Satna;Secunderabad;Sehore;Serampore;Sangrur;Sirhind;Shillong;Shimla;Shirdi;ShivaGanga;Shivpuri;Silvassa;Singrauli;Sirsa;Sikar;Siwan;Somnath;Sonipat;Sopore;Srikakulam;Srirangapattna;Srinagar;Sultanpur;Surat;Surendranagar;Suri;Tawang;Tezpur;Thrippunithura;Thrissur;Tiruchchirappalli;Tirumala;Tirunelveli;Thiruvannamalai;Tirur;Thalassery;Thanjavur;Thekkady;Theni;Thiruvananthpuram;Tirupati;Trichy;Trippur;Tumkur;Tuni;Udaipur;Udhampur;Udupi;Ujjain;Unnao;Ujjain Fort;Vidisha;Vadodra;Valsad;Vapi;Varanasi;Varkala;Vasco da Gama;Vellore;Vishakhapatnam;Vijayawada;Vizianagaram;Vrindavan;Warangal;Washim;Yamunanagar;Yelahanka".split(
            ";"
        ),
        MONTHS: [
            { code: 0, title: "January", days: 31 },
            { code: 1, title: "February", days: 28 },
            { code: 2, title: "March", days: 31 },
            { code: 3, title: "April", days: 30 },
            { code: 4, title: "May", days: 31 },
            { code: 5, title: "June", days: 30 },
            { code: 6, title: "July", days: 31 },
            { code: 7, title: "August", days: 31 },
            { code: 8, title: "September", days: 30 },
            { code: 9, title: "October", days: 31 },
            { code: 10, title: "November", days: 30 },
            { code: 11, title: "December", days: 31 },
        ],
        INDIA_COLOR_MAP: {
            AP: { state: "Andhra Pradesh", id: "ANDHRA PRADESH", color: "#FFDC00" },
            HP: { state: "Himachal Pradesh", id: "HIMACHAL PRADESH", color: "#01FF70" },
            GA: { state: "Goa", id: "GOA", color: "#001F3F" },
            WB: { state: "West Bengal", id: "WEST BENGAL", color: "#FF4136" },
            KL: { state: "Kerala", id: "KERALA", color: "#3D9970" },
            TN: { state: "Tamil Nadu", id: "TAMIL NADU", color: "#FF851B" },
            KA: { state: "Karnataka", id: "KARNATAKA", color: "#7FDBFF" },
            UK: { state: "Uttarakhand", id: "UTTARAKHAND", color: "#B10DC9" },
            DD: { state: "Daman And Diu", id: "DAMAN AND DIU", color: "#F012BE" },
            UP: { state: "Uttar Pradesh", id: "UTTAR PRADESH", color: "#39CCCC" },
            MH: { state: "Maharashtra", id: "MAHARASHTRA", color: "#0074D9" },
            SK: { state: "Sikkim", id: "SIKKIM", color: "#2ECC40" },
            RJ: { state: "Rajasthan", id: "RAJASTHAN", color: "#85144B" },
            OD: { state: "Odisha", id: "ODISHA", color: "#89BDD3" },
            JH: { state: "Jharkhand", id: "JHARKHAND", color: "#9068be" },
            JK: { state: "Jammu And Kashmir", id: "JAMMU AND KASHMIR", color: "#b56969" },
            GJ: { state: "Gujarat", id: "GUJARAT", color: "#daad86" },
            CG: { state: "Chhattisgarh", id: "CHHATTISGARH", color: "#aa863a" },
            MP: { state: "Madhya Pradesh", id: "MADHYA PRADESH", color: "#64706c" },
        },
        TAX_NAME: { CGST: "CGST", SGST: "SGST", IGST: "IGST" },
        CORPORATE_BASE_LOCATION: "Tamil Nadu",
        USER_DEFAULT_LOCATION: "CHENNAI",
        HSD_DEFAULT_NIGHTS: 2,
        BOOKING_STATUS: {
            PAYMENT_PENDING: "PENDING",
            PAYMENT_SUCCESS: "IN PROGRESS",
            PAYMENT_COLLECTION_UPDATED: "IN PROGRESS",
            AIRPAY_DETAILS_UPDATED: "IN PROGRESS",
            PAYMENT_SUCCESSFULL_CHMR_SYNC_PENDING: "CONFIRMED",
            BOOKING_FAILED_PAYMENT_FAILED: "FAILED",
            BOOKING_FAILED_CHMR_SYNC_FAILED: "FAILED",
            BOOKING_CONFIRMED_CHMR_SYNC_SUCCESSFULL: "CONFIRMED",
            BOOKING_CANCEL_FAILED_CHMR_SYNC_FAILED: "CONFIRMED",
            BOOKING_CANCELLED: "CANCELLED",
            Created: "PENDING",
            Confirmed: "CONFIRMED",
            Cancelled: "CANCELLED",
            Refused: "REFUSED",
            Blocked: "BLOCKED",
        },
        GOOGLE_API_KEY: "AIzaSyCXz_JVyzACswjlHoj7iJUxfVscsybe7To",
        DEFAULT_COUNTRY_CODE: "+91",
        MOBILE_MAXLENGTH_INDIA: "10",
        MOBILE_MAXLENGTH_OTHER: "15",
        MOBILE_MINLENGTH_OTHER: "8",
        MOBILE_MINLENGTH_OTHER_KNOW_MORE: "10",
        USER_NAME_MAXLENGTH: 20,
        SESSION_API_ERR_CODE: ["6102"],
    },
    PAGE = {
        index: contentUrlIndexPath,
        hsdBookingWidget: contentUrlPath + "/hsd-booking-widget" + htmlExtension,
        hsdResult: contentUrlPath + "/bookings/availability" + htmlExtension,
        hsdSummary: contentUrlPath + "/hsd-booking-widget/hsd-summary" + htmlExtension,
        hsdBookingConfirmation: contentUrlPath + "/hsd-booking-widget/hsd-booking-confirmation" + htmlExtension,
        roomRooms: contentUrlPath + "/bookings/no-rooms" + htmlExtension,
        feedBackAndQueries: contentUrlPath + "/feedback-and-queries" + htmlExtension,
        manageBooking: contentUrlPath + "/manage-booking" + htmlExtension,
        hsdDashboard: contentUrlPath + "/hsd-dashboard" + htmlExtension,
        offersAndPackages: contentUrlPath + "/offers-packages" + htmlExtension,
        venueofferpackages: contentUrlPath + "/venuecoupon" + htmlExtension,
        packageResult: contentUrlPath + "/offers-packages/package-result" + htmlExtension,
        packageSummary: contentUrlPath + "/offers-packages/package-summary" + htmlExtension,
        packageConfirmation: contentUrlPath + "/offers-packages/package-confirmation" + htmlExtension,
        voLanding: contentUrlPath + "/vacation-ownership" + htmlExtension,
        resort: contentUrlPath + "/resorts-hotels" + htmlExtension,
        destination: contentUrlPath + "/destination" + htmlExtension,
        voDashboard: contentUrlPath + "/vo-dashboard" + htmlExtension,
        voPurchase: contentUrlPath + "/vo-purchase" + htmlExtension,
        cancelBooking: contentUrlPath + "/cancel-booking" + htmlExtension,
        careersPage: contentUrlPath + "/careers" + htmlExtension,
        voBookingResultPage: contentUrlPath + "/vo-booking-widget/vo-result" + htmlExtension,
        voBookingSummaryPage: contentUrlPath + "/vo-booking-widget/vo-summary" + htmlExtension,
        voBookingConfirmationPage: contentUrlPath + "/vo-booking-widget/vo-confirmation" + htmlExtension,
        voCancelBooking: contentUrlPath + "/vo-booking-widget/vo-cancel-booking" + htmlExtension,
        meetingEvents: contentUrlPath + "/meetings-events" + htmlExtension,
        WelcomeResultPage: contentUrlPath + "/vo-welcome-offer/welcome-result" + htmlExtension,
        WelcomeSummaryPage: contentUrlPath + "/vo-welcome-offer/welcome-summary" + htmlExtension,
        paymentProcessing: contentUrlPath + "/payment-processing" + htmlExtension,
        hsdPaymentProcessing: contentUrlPath + "/hsd-payment-processing" + htmlExtension,
        bookingWidgetResort: contentUrlPath + "/resorts-hotels/",
        destinationPage: contentUrlPath + "/destination/",
        venueOfferPage: contentUrlPath + "/venuecoupon" + htmlExtension,
        venueOfferResultPage: contentUrlPath + "/venue-offer/venue-result" + htmlExtension,
        venueOfferSummaryPage: contentUrlPath + "/venue-offer/venue-summary" + htmlExtension,
        venueOfferConfirmationPage: contentUrlPath + "/venue-offer/venue-confirmation" + htmlExtension,
        availability: contentUrlPath + "/bookings/availability" + htmlExtension,
        hsdSearchPage: contentUrlPath + "/bookings" + htmlExtension,
    },
    MessageRepository = {
        LIST: {
            ERR0001: { type: "ERROR", header: "Sample Header", message: "Sample Error" },
            ERR0002: { type: "ERROR", header: "Error", message: "Please fix all the errors and submit." },
            ERR0003: { type: "ERROR", header: "Sorry!", message: "Payment failed" },
            ERR0004: { type: "ERROR", header: "Authentication Error", message: "Login failed. Invalid Credentials!" },
            ERR0005: { type: "ERROR", header: "Error", message: "Invalid Request" },
            ERR0006: { type: "ERROR", header: "Sorry", message: "Cancellation cannot be done at this moment. Please try again later" },
            ERR0007: { type: "ERROR", header: "Error", message: "Invalid EmailID" },
            ERR0008: { type: "ERROR", header: "Error", message: "Booking Cancellation Failed" },
            ERR0009: { type: "ERROR", header: "Error", message: "Invalid CV" },
            ERR0010: { type: "ERROR", header: "Error", message: "Update Failure" },
            ERR0011: { type: "ERROR", header: "Error", message: "Email Id or Mobile number is already registered" },
            ERR0012: { type: "ERROR", header: "Error", message: "Please enter a valid OTP" },
            ERR0013: { type: "ERROR", header: "Error", message: "Current password mismatch" },
            ERR0014: { type: "ERROR", header: "Error", message: "Invalid OTP" },
            ERR0015: { type: "ERROR", header: "Error", message: "Sorry! Internal error." },
            SUC0001: { type: "SUCCESS", header: "Sample Header", message: "Sample Success" },
            SUC0002: { type: "SUCCESS", header: "Thank you", message: "Your complaints/queries has been sent. Our representative will get back to you soon." },
            SUC0003: { type: "SUCCESS", header: "Success", message: "Your password has been updated successfully" },
            SUC0004: { type: "SUCCESS", header: "Booking Cancelled", message: "Your booking has been successfully cancelled" },
            SUC0005: { type: "SUCCESS", header: "Thank you", message: "Your profile details have been submitted successfully. Our representative will call you soon for KYC and verification." },
            SUC0007: { type: "SUCCESS", header: "Thank you", message: "Your ratings and reviews are saved successfully" },
            SUC0008: { type: "SUCCESS", header: "Success", message: "Your data are saved successfully" },
            INF0001: { type: "INFORMATION", header: "Sample Header", message: "Sample Information" },
            INF0002: { type: "INFORMATION", header: "Thank You", message: "Your CV has been mailed" },
            INF0003: { type: "INFORMATION", header: "Sorry", message: "Upgrade cannot be added" },
            WAR0001: { type: "WARNING", header: "Sample Header", message: "Sample Warning" },
            WAR0002: { type: "WARNING", header: "WARNING", message: "Some error occurred, Please try again." },
        },
    };
$(document).ready(function () {
    var a = "";
    $("#showOtpToRegister").hide();
    $("#isOTPResent").hide();
    $(document).on("click", "#guestSignUpBtn", function () {
        $("#guestSignUpBtn").disableButton();
        if (validateGuestSignUpForm("validateAll")) {
            var b = {
                emailId: $("#individual_signupform_email").val(),
                mobileNo: $("#individual_signupform_mobile").val(),
                otpFor: "HSD_REG_FLOW",
                value: $("#individual_signupform_firstname").val() + " " + $("#individual_signupform_lastname").val(),
            };
            getOTPForHSDIndividual(b, function (b) {
                $("#guestSignUpBtn").enableButton();
                if ("OK" == b.statusText || "success" == b.statusText)
                    "failed" == b.responseJSON.status && display({ type: "ERROR", header: "Error", message: API_ERROR[b.responseJSON.apiError] }),
                        "success" == b.responseJSON.status &&
                            (b.responseJSON.data && b.responseJSON.data.uniqueId && (a = b.responseJSON.data.uniqueId),
                            setMaskedMobileAndEmail("guestMobile1", $("#individual_signupform_mobile").val(), "guestEmail1", $("#individual_signupform_email").val()),
                            $("#showRegister").hide(),
                            $("#isOTPResent").hide(),
                            $("#showOtpToRegister").show());
            });
        }
    });
    $(document).on("click", "#resendOTP", function () {
        var b = {
            emailId: $("#individual_signupform_email").val(),
            mobileNo: $("#individual_signupform_mobile").val(),
            otpFor: "HSD_REG_FLOW",
            value: $("#individual_signupform_firstname").val() + " " + $("#individual_signupform_lastname").val(),
        };
        getOTPForHSDIndividual(b, function (b) {
            $("#guestSignUpBtn").enableButton();
            if ("OK" == b.statusText || "success" == b.statusText)
                "failed" == b.responseJSON.status && display({ type: "ERROR", header: "Error", message: API_ERROR[b.responseJSON.apiError] }),
                    "success" == b.responseJSON.status &&
                        (b.responseJSON.data && b.responseJSON.data.uniqueId && (a = b.responseJSON.data.uniqueId),
                        setMaskedMobileAndEmail("guestMobile2", $("#individual_signupform_mobile").val(), "guestEmail2", $("#individual_signupform_email").val()),
                        $("#isOTPResent").show());
        });
    });
    $(document).on("click", "#submitIndividualSignupForm", function () {
        $("#submitIndividualSignupForm").disableButton();
        var b = {
            otp: $("#individual_signupform_otp").val(),
            email: $("#individual_signupform_email").val(),
            firstName: $("#individual_signupform_firstname").val(),
            lastName: $("#individual_signupform_lastname").val(),
            mobileNo: $("#individual_signupform_mobile").val(),
            countryCode: $("#individual_signupform_countryCode").val(),
            password: $("#individual_signupform_password").val(),
            otpUniqueId: a,
            recordType: "012a0000000AQYU",
        };
        registerHSDIndividual(b, function (a) {
            if ("OK" == a.statusText || "success" == a.statusText)
                "failed" == a.responseJSON.status && display({ type: "ERROR", header: "Error", message: API_ERROR[a.responseJSON.apiError] }),
                    "success" == a.responseJSON.status && ($("#modal-authentication").modal("hide"), $("#signUpHsd").modal("hide"));
        });
    });
    $("#individual_signupform_firstname").blur(function () {
        validateGuestSignUpForm("fname");
    });
    $("#individual_signupform_lastname").blur(function () {
        validateGuestSignUpForm("lname");
    });
    $("#individual_signupform_mobile").blur(function () {
        validateGuestSignUpForm("mobile");
    });
    $("#individual_signupform_email").blur(function () {
        validateGuestSignUpForm("email");
    });
    $("#individual_signupform_password").blur(function () {
        validateGuestSignUpForm("pwd");
    });
    $("#individual_signupform_confirmpassword").blur(function () {
        validateGuestSignUpForm("cmPwd");
    });
    $("#individual_signupform_otp").blur(function () {
        validateGuestSignUpForm("otp");
    });
});
function validateGuestSignUpForm(a) {
    var b = !0;
    if ("validateAll" == a || "fname" == a)
        $("#individual_signupform_firstname").isEmpty()
            ? ($("#guestFirstNameError").html(UIERRORS.FIRST_NAME_REQUIRED), (b = !1))
            : alphaValidation($("#individual_signupform_firstname").val())
            ? $("#guestFirstNameError").html(UIERRORS.EMPTY)
            : ($("#guestFirstNameError").html(UIERRORS.FIRST_NAME_ALPHABETS), (b = !1));
    if ("validateAll" == a || "lname" == a)
        $("#individual_signupform_lastname").isEmpty()
            ? ($("#guestLastNameError").html(UIERRORS.LAST_NAME_REQUIRED), (b = !1))
            : alphaValidation($("#individual_signupform_lastname").val())
            ? $("#guestLastNameError").html(UIERRORS.EMPTY)
            : ($("#guestFirstNameError").html(UIERRORS.LAST_NAME_ALPHABETS), (b = !1));
    if ("validateAll" == a || "mobile" == a)
        $("#individual_signupform_mobile").isEmpty()
            ? ($("#guestPhoneNumberError").html(UIERRORS.MOBILE_REQUIRED), (b = !1))
            : validateNumeric($("#individual_signupform_mobile").val())
            ? validatePhoneLength($("#individual_signupform_mobile").val())
                ? $("#guestPhoneNumberError").html(UIERRORS.EMPTY)
                : ($("#guestPhoneNumberError").html(UIERRORS.MOBILE_MINIMUM), (b = !1))
            : ($("#guestPhoneNumberError").html(UIERRORS.MOBILE_NUMBER), (b = !1));
    if ("validateAll" == a || "email" == a)
        $("#individual_signupform_email").isEmpty()
            ? ($("#guestEmailError").html(UIERRORS.EMAIL_REQUIRED), (b = !1))
            : validateEmail($("#individual_signupform_email").val())
            ? $("#guestEmailError").html(UIERRORS.EMPTY)
            : ($("#guestEmailError").html(UIERRORS.EMAIL_INVALID), (b = !1));
    if ("validateAll" == a || "pwd" == a)
        $("#individual_signupform_password").isEmpty()
            ? ($("#guestPasswordError").html(UIERRORS.PASSWORD_REQUIRED), (b = !1))
            : "string" === typeof passwordValidation($("#individual_signupform_password").val())
            ? ($("#guestPasswordError").html(passwordValidation($("#individual_signupform_password").val())), (b = !1))
            : $("#guestPasswordError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "cmPwd" == a)
        $("#individual_signupform_confirmpassword").isEmpty()
            ? ($("#guestConfirmpasswordError").html(UIERRORS.PASSWORD_REQUIRED), (b = !1))
            : 1 != passwordValidation($("#individual_signupform_confirmpassword").val())
            ? ($("#guestConfirmpasswordError").html(passwordValidation($("#individual_signupform_confirmpassword").val())), (b = !1))
            : !1 === comparePassword($("#individual_signupform_password").val(), $("#individual_signupform_confirmpassword").val())
            ? ($("#guestConfirmpasswordError").html(UIERRORS.PASSWORD_MATCH_ERROR), (b = !1))
            : $("#guestConfirmpasswordError").html(UIERRORS.EMPTY);
    "otp" == a &&
        ($("#individual_signupform_otp").isEmpty()
            ? ($("#errorMsg_otp").html(UIERRORS.OTP_REQUIRED), $("#submitIndividualSignupForm").disableButton())
            : ($("#errorMsg_otp").html(UIERRORS.EMPTY), $("#submitIndividualSignupForm").enableButton()));
    b ? $("#guestSignUpBtn").enableButton() : $("#guestSignUpBtn").disableButton();
    return b;
}
function setMaskedMobileAndEmail(a, b, c, d) {
    $("#" + a).html(getMaskedMobile(b));
    $("#" + c).html(getMaskedMail(d));
}
function passwordValidation(a) {
    if (6 <= a.length) {
        if (15 >= a.length) {
            var b = /[*@!#%&$()^~{}]+/.test(a),
                c = /[A-Z]+/.test(a),
                d = /[a-z]+/.test(a);
            a = /[0-9]+/.test(a);
            return c && d && b && a ? !0 : "Password should contain atleast 1 special character, 1 upper case, 1 lower case and 1 digit";
        }
        return "Password should contain maximum of 15 characters";
    }
    return "Password should contain minimum of 6 characters";
}
function comparePassword(a, b) {
    return a && b ? (a === b ? !0 : !1) : !1;
}
function getMaskedMobile(a) {
    return "X".repeat(a.length - 4) + a.slice(-4);
}
function getMaskedMail(a) {
    var b = a.substring(0, a.lastIndexOf("@")),
        c = a.substring(a.lastIndexOf("@"), a.length);
    return 3 < b.length ? "X".repeat(b.length - 3) + b.slice(-3) + c : a;
}
function requiredValidation(a) {
    return a ? !0 : !1;
}
function alphaValidation(a) {
    var b = /^[a-zA-Z]+$/;
    return a ? (b.test(a) ? !0 : !1) : !1;
}
function alphaSpaceValidation(a) {
    var b = /^[a-zA-Z ]+$/;
    return a ? (b.test(a) ? !0 : !1) : !1;
}
function alphaNumberValidation(a) {
    var b = /^[a-zA-Z0-9]*$/;
    return a ? (b.test(a) ? !0 : !1) : !1;
}
function numberValidation(a) {
    var b = /^[0-9]*$/;
    return a ? (b.test(a) ? !0 : !1) : !1;
}
function passwordMatchValidation(a, b) {
    if (a && b) return a === b ? !0 : !1;
}
function emailValidation(a) {
    var b = /^(([a-zA-Z0-9$_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5}){1,25})+([;.](([a-zA-Z0-9_\-\.]+)@{[a-zA-Z0-9_\-\.]+0\.([a-zA-Z]{2,5}){1,25})+)*$/;
    return a ? (b.test(a) ? !0 : !1) : !1;
}
function commentValidation(a) {
    var b = /^[a-zA-Z0-9 ]*$/;
    return a ? (b.test(a) ? !0 : !1) : !1;
}
function dobFutureValidation(a) {
    var b = new Date();
    a = new Date(a);
    if (a.getFullYear() > b.getFullYear()) return !1;
    if (a.getFullYear() == b.getFullYear()) {
        if (a.getMonth() > b.getMonth()) return !1;
        if (a.getMonth() == b.getMonth()) return a.getDate() >= b.getDate() ? !1 : !0;
    } else return !0;
}
function dob18PlusValidation(a) {
    function b(a, b, c) {
        var d = new Date();
        a = Math.floor((d.getTime() - new Date(c, b, a)) / 864e5);
        a -= Math.floor((d.getFullYear() - c) / 4);
        return a / 365;
    }
    var c = new Date(a);
    a = c.getDate();
    var d = c.getMonth();
    c = c.getFullYear();
    return !(function (a, b, c) {
        var d = new Date(c, b, a);
        return d.getFullYear() != c || d.getMonth() != b || d.getDate() != a ? !1 : !0;
    })(a, d, c) || 18 > b(a, d, c)
        ? !1
        : !0;
}
function dateGreaterCheckValidation(a, b) {
    a = new Date(a);
    b = new Date(b);
    if (a.getFullYear() > b.getFullYear()) return !1;
    if (a.getFullYear() == b.getFullYear()) {
        if (a.getMonth() > b.getMonth()) return !1;
        if (a.getMonth() == b.getMonth()) return a.getDate() >= b.getDate() ? !1 : !0;
    } else return !0;
}
function currentDateBetweenCheckValidation(a, b) {
    var c = new Date(b);
    b = new Date();
    a = Date.parse(new Date(a));
    c = Date.parse(c);
    b = Date.parse(b);
    return b <= c && b >= a ? !0 : !1;
}
function dateBetweenCheckValidation(a, b, c) {
    c = new Date(c);
    a = new Date(a);
    b = Date.parse(new Date(b));
    c = Date.parse(c);
    a = Date.parse(a);
    return a <= c && a >= b ? !0 : !1;
}
function currentDateGreaterCheckValidation(a) {
    var b = new Date();
    a = new Date(a);
    b = Date.parse(b);
    a = Date.parse(a);
    return b > a ? !0 : !1;
}
function dateLesserCheckValidation(a, b) {
    a = new Date(a);
    b = new Date(b);
    if (a.getFullYear() < b.getFullYear()) return !0;
    if (a.getFullYear() == b.getFullYear()) {
        if (a.getMonth() < b.getMonth()) return !0;
        if (a.getMonth() == b.getMonth()) return a.getDate() < b.getDate() ? !0 : !1;
    } else return !1;
}
function datePastCheckValidation(a) {
    var b = new Date();
    a = new Date(a);
    if (a.getFullYear() > b.getFullYear()) return !1;
    if (a.getFullYear() == b.getFullYear()) {
        if (a.getMonth() > b.getMonth()) return !1;
        if (a.getMonth() == b.getMonth()) return a.getDate() >= b.getDate() ? !1 : !0;
    } else return !0;
}
function minLengthValidation(a, b) {
    return a.length >= b ? !0 : !1;
}
function maxLengthValidation(a, b) {
    return a.length <= b ? !0 : !1;
}
function minMaxValidation(a, b, c) {
    a = "string" == typeof a ? parseInt(a) : a;
    return a >= b && a <= c ? !0 : !1;
}
function maxValidation(a, b) {
    return ("string" == typeof a ? parseInt(a) : a) >= b ? !1 : !0;
}
function minValidation(a, b) {
    return ("string" == typeof a ? parseInt(a) : a) <= b ? !0 : !1;
}
function display(a) {
    a = "string" == typeof a ? MessageRepository.LIST[a] : a;
    switch (a.type) {
        case "ERROR":
            var b = "modal-message-error";
            break;
        case "SUCCESS":
            b = "modal-message-success";
            break;
        case "INFORMATION":
            b = "modal-message-info";
            break;
        case "WARNING":
            b = "modal-message-warning";
    }
    $("#" + b + " #message-header").html(a.header);
    $("#" + b + " #message-body").html(a.message);
    $("#" + b).modal("show");
}
function login(a, b, c) {
    var d = "Basic " + SterlEncrypto2017.encode(b);
    $.ajax({
        type: "POST",
        url: a,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(b),
        cache: !0,
        beforeSend: function (a) {
            a.setRequestHeader("Content-Type", "application/json");
            a.setRequestHeader("Access-Control-Allow-Origin", "http://localhost:4502");
            a.setRequestHeader("Authorization", d);
        },
        complete: function (b, d) {
            localCache.set(a, b, c);
        },
    });
}
function http_post(a, b, c, d) {
    $.ajax({
        type: "POST",
        url: a,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(c),
        cache: !0,
        beforeSend: function (a) {
            a.setRequestHeader("Content-Type", "application/json");
            a.setRequestHeader("Access-Control-Allow-Origin", "http://localhost:4502");
            a.setRequestHeader("X-AUTH-TOKEN", d);
        },
        complete: function (c, d) {
            localCache.set(a, c, b);
        },
    });
}
function http_get(a, b) {
    var c = session_get().authHeader;
    $.ajax({
        type: "GET",
        url: a,
        cache: !0,
        beforeSend: function (a) {
            a.setRequestHeader("Accept", "application/json");
            a.setRequestHeader("Access-Control-Allow-Origin", "http://localhost:4502");
            a.setRequestHeader("X-AUTH-TOKEN", c);
        },
        complete: function (c, e) {
            localCache.set(a, c, b);
        },
    });
}
function commonPostCall(a, b, c) {
    $.ajax({
        type: "POST",
        url: a,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(b),
        cache: !0,
        complete: function (b, e) {
            localCache.set(a, b, c);
        },
    });
}
function resetPasswordUsingEmail(a, b, c, d) {
    a = { contactType: "EMAIL", value: a };
    var e = function (a) {
        d(a.responseJSON);
    };
    "vo" == c
        ? ((a.otpFor = "true" === b ? "VO_RESET_PASS" : "VO_FORGOT_PASS"), http_post(GlobalConstants.DOMAIN_URL + GlobalConstants.URL.VO.VO_FORGET_PSWD_WITHOTP, e, a))
        : "hsd" == c && ((a.otpFor = "true" === b ? "HSD_RESET_PASS" : "HSD_FORGOT_PASS"), http_post(GlobalConstants.DOMAIN_URL + GlobalConstants.URL.HSD.HSD_FORGET_PSWD_WITHOTP, e, a));
}
function resetPasswordWithOTP(a, b, c) {
    var d = function (a) {
        c(a.responseJSON);
    };
    "hsd" == b ? http_post(GlobalConstants.DOMAIN_URL + GlobalConstants.URL.HSD.RESET_PSWD, d, a) : http_post(GlobalConstants.DOMAIN_URL + GlobalConstants.URL.VO.RESET_PSWD, d, a);
}
$(document).ready(function () {
    $(document).on("click", "#resetPasswordUsingEmailBtn", function () {
        forgotPasswordUsingEmail(!1);
    });
    $(document).on("click", "#chResendOtp", function () {
        resendOtp(!1);
    });
    $(document).on("click", "#forgotPasswordChangeBtn", function () {
        validateGuestChangePwd("validateAll") && ($("#forgotPasswordChangeBtn").disableButton(), forgotPasswordChange());
    });
    $("#forgotemailId").keyup(function () {
        validateGuestResetPwd("email");
    });
    $("#chOtp").keyup(function () {
        validateGuestChangePwd("otp");
    });
    $("#chNewPswd").keyup(function () {
        validateGuestChangePwd("pwd");
    });
    $("#chNewPswdCnfrm").keyup(function () {
        validateGuestChangePwd("cmPwd");
    });
    $("#otp").keyup(function () {
        validateVOResetPwd("otp");
    });
    $("#currentPswd").keyup(function () {
        validateVOResetPwd("cpwd");
    });
    $("#newPswd").keyup(function () {
        validateVOResetPwd("npwd");
    });
    $("#newPswdCnfrm").keyup(function () {
        validateVOResetPwd("cnPwd");
    });
});
function validateGuestResetPwd(a) {
    var b = !0,
        c = !0;
    "email" == a &&
        ($("#forgotemailId").isEmpty()
            ? ($("#forgotEmailError").html(UIERRORS.EMAIL_REQUIRED), (b = !1), (c = !0))
            : validateEmail($("#forgotemailId").val())
            ? ($("#forgotEmailError").html(UIERRORS.EMPTY), (c = !1))
            : ($("#forgotEmailError").html(UIERRORS.EMAIL_INVALID), (b = !1), (c = !0)));
    c ? $("#resetPasswordUsingEmailBtn").disableButton() : $("#resetPasswordUsingEmailBtn").enableButton();
    return b;
}
function validateGuestChangePwd(a) {
    var b = !0;
    if ("validateAll" == a || "otp" == a) $("#chOtp").isEmpty() ? ($("#chForgotOtpError").html(UIERRORS.OTP_REQUIRED), (b = !1)) : $("#chForgotOtpError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "pwd" == a)
        $("#chNewPswd").isEmpty()
            ? ($("#chForgotNewPswdError").html(UIERRORS.PASSWORD_REQUIRED), (b = !1))
            : "string" === typeof passwordValidation($("#chNewPswd").val())
            ? ($("#chForgotNewPswdError").html(passwordValidation($("#chNewPswd").val())), (b = !1))
            : $("#chForgotNewPswdError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "cmPwd" == a)
        $("#chNewPswdCnfrm").isEmpty()
            ? ($("#chForgotNewPswdCnfrmError").html(UIERRORS.PASSWORD_REQUIRED), (b = !1))
            : 1 != passwordValidation($("#chNewPswdCnfrm").val())
            ? ($("#chForgotNewPswdCnfrmError").html(passwordValidation($("#chNewPswdCnfrm").val())), (b = !1))
            : !1 === comparePassword($("#chNewPswd").val(), $("#chNewPswdCnfrm").val())
            ? ($("#chForgotNewPswdCnfrmError").html(UIERRORS.PASSWORD_MATCH_ERROR), (b = !1))
            : $("#chForgotNewPswdCnfrmError").html(UIERRORS.EMPTY);
    b ? $("#forgotPasswordChangeBtn").enableButton() : $("#forgotPasswordChangeBtn").disableButton();
    return b;
}
function validateVOResetPwd(a) {
    var b = !0;
    if ("validateAll" == a || "otp" == a) $("#otp").isEmpty() ? ($("#otpError").html(UIERRORS.OTP_REQUIRED), (b = !1)) : $("#otpError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "cpwd" == a)
        $("#currentPswd").isEmpty()
            ? ($("#currentPswdError").html(UIERRORS.PASSWORD_REQUIRED), (b = !1))
            : "string" === typeof passwordValidation($("#currentPswd").val())
            ? ($("#currentPswdError").html(passwordValidation($("#currentPswd").val())), (b = !1))
            : $("#currentPswdError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "npwd" == a)
        $("#newPswd").isEmpty()
            ? ($("#newPswdError").html(UIERRORS.PASSWORD_REQUIRED), (b = !1))
            : "string" === typeof passwordValidation($("#newPswd").val())
            ? ($("#newPswdError").html(passwordValidation($("#newPswd").val())), (b = !1))
            : $("#newPswdError").html(UIERRORS.EMPTY);
    if ("validateAll" == a || "cnPwd" == a)
        $("#newPswdCnfrm").isEmpty()
            ? ($("#newPswdCnfrmError").html(UIERRORS.PASSWORD_REQUIRED), (b = !1))
            : 1 != passwordValidation($("#newPswdCnfrm").val())
            ? ($("#newPswdCnfrmError").html(passwordValidation($("#newPswdCnfrm").val())), (b = !1))
            : !1 === comparePassword($("#newPswd").val(), $("#newPswdCnfrm").val())
            ? ($("#newPswdCnfrmError").html(UIERRORS.PASSWORD_MATCH_ERROR), (b = !1))
            : $("#newPswdCnfrmError").html(UIERRORS.EMPTY);
    b ? $("#resetPasswordBtn").enableButton() : $("#resetPasswordBtn").disableButton();
    return b;
}
function forgotPasswordUsingEmail(a) {
    $("#resetPasswordUsingEmailBtn").disableButton();
    var b = $("#forgotemailId").val(),
        c = $("#currentUserTypeResetPwd").text();
    resetPasswordUsingEmail(b, a, c, callbackResetPasswordByemail);
}
function resendOtp(a) {
    var b = $("#forgotemailId").val(),
        c = $("#currentUserTypeResetPwd").text();
    resetPasswordUsingEmail(b, a, c, callbackResetPasswordByemail);
}
function forgotPasswordChange() {
    var a = $(".setEmail").val(),
        b = $("#chNewPswd").val(),
        c = $("#chNewPswdCnfrm").val(),
        d = $("#chOtp").val(),
        e = $("#currentUserTypeResetPwd").text();
    resetPasswordWithOTP({ confirmPassword: c, email: a, newPassword: b, otp: d, webStatus: null }, e, calBackResetPwdOtp);
}
function callbackResetPasswordByemail(a) {
    a && a.data ? ((a = a.data.uniqueId), $("#modal-forgot-pwd-email").modal("hide"), $("#modal-change-password").modal("show"), $(".setEmail").val(a)) : $("#invalidEmailResetPwd").html(API_ERROR[a.apiError]);
}
function calBackResetPwdOtp(a) {
    a && ("failed" == a.status ? $("#chInvalidOtp").html(API_ERROR[a.apiError]) : ($("#chInvalidOtp").html(UIERRORS.EMPTY), $("#modal-change-password").modal("hide"), $("#modal-reset-password").modal("hide"), display("SUC0003")));
}
function clearSessionClose() {
    clear();
}
function resetPasswordCallbackFun(a) {
    a && "failed" == a.status
        ? $("#resetPwdServiceError").html(API_ERROR[a.apiError])
        : ($("#modal-change-password").modal("hide"),
          $("#modal-reset-password").modal("hide"),
          display("SUC0003"),
          (a = session_get()),
          isVOFirstTimeLogin()
              ? setTimeout(function () {
                    signout();
                }, 2e3)
              : a.isLoggedIn && "CUSTOMER" == a.user.userType && updateVODashboard(a.user.primaryid, a.user.current, dashBoardSuccessCall));
}
function resetPassword() {
    if (validateVOResetPwd("validateAll")) {
        $("#resetPasswordBtn").disableButton();
        var a = { confirmPassword: $("#newPswdCnfrm").val(), currentPassword: $("#currentPswd").val(), email: $(".setEmail").val(), newPassword: $("#newPswd").val(), otp: $("#otp").val() };
        resetPasswordWithOTP(a, "vo", resetPasswordCallbackFun);
    }
}
function resetPwdDashboard(a, b) {
    resetPasswordUsingEmail(a, b, "vo", function (a) {
        a && a.data ? ((a = a.data.uniqueId), $("#modal-authentication").modal("hide"), $("#modal-reset-password").modal("show"), $(".setEmail").val(a)) : $("#resetPwdServiceError").html(API_ERROR[a.apiError]);
    });
}
function resetPwdHsdDashboard(a, b) {}
function resendOTPForReset() {
    var a = $(".setEmail").val();
    "vo" == getSessionData("userType") && resetPwdDashboard(a, "true");
}
function isVOFirstTimeLogin() {
    var a = session_get();
    if (a && a.user && "CUSTOMER" == a.user.userType) {
        var b = null;
        a.user.contracts[0] && null != a.user.contracts[0].webStatus && (b = a.user.contracts[0].webStatus);
        return null == b;
    }
    return !1;
}
$(document).ready(function () {
    $("#manageBookingOtpDiv").hide();
    $("#invalidBookingID").hide();
    $(document).on("click", ".manageBooking", function (a) {
        $("#booking-dropdown").removeClass("open");
        $("#closeManageBooking").enableButton();
        a.stopPropagation();
        $("#closeManageBooking").enableButton();
        $("#manageBookingDrpMenu-otp").toggle();
        $("#find_booking").disableButton();
        $("#bookingNoError").html(UIERRORS.EMPTY);
    });
    $(document).on("click", "#find_booking", function () {
        $("#find_booking").disableButton();
        getOtpForMangeBooking();
    });
    $(document).on("click", "#resendManageBookingOTP", function () {
        $("#getCVDetailsForManageBooking").disableButton();
        getOtpForMangeBooking("resend");
    });
    $(document).on("click", "#manageBookingDrpMenu", function (a) {
        a.stopPropagation();
    });
    $(document).on("click", "#closeManageBooking", function (a) {
        $("#mo_no").val("");
        $("#booking_no").val("");
        $("#manageBookingDrpMenu").toggle();
        $("#manageBookingDrpMenu-otp").toggle();
        $(".manageBooking").enableButton();
    });
    $(document).on("click", "#getCVDetailsForManageBooking", function () {
        getCVDetailsForManageBooking();
    });
    $("#booking_no").keyup(function () {
        $("#booking_no").isEmpty()
            ? ($("#bookingNoError").html(UIERRORS.BOOKING_NUM_REQUIRED), $("#find_booking").disableButton())
            : alphaNumberValidation($("#booking_no").val())
            ? ($("#bookingNoError").html(UIERRORS.EMPTY), $("#find_booking").enableButton())
            : ($("#bookingNoError").html(UIERRORS.BOOKING_NUM_ALPHA_NUMBER), $("#find_booking").disableButton());
    });
    $("#manage_booking_otp").keyup(function () {
        $("#manage_booking_otp").isEmpty()
            ? ($("#invalidManageOtp").show(), $("#invalidManageOtp").html(UIERRORS.OTP_REQUIRED), $("#getCVDetailsForManageBooking").disableButton())
            : ($("#invalidManageOtp").hide(), $("#invalidManageOtp").html(UIERRORS.EMPTY), $("#getCVDetailsForManageBooking").enableButton());
    });
    $("#vo_booking_no").keyup(function () {
        checkHeaderValidation("booking_no");
    });
    $("#vo_manage_FirstName").keyup(function () {
        checkHeaderValidation("manageFirstName");
    });
    $("#vo_manage_LastName").keyup(function () {
        checkHeaderValidation("manageLastName");
    });
});
function checkHeaderValidation(a) {
    "booking_no" == a &&
        ($("#vo_booking_no").isEmpty()
            ? ($("#bookingNoError").html(UIERRORS.BOOKING_NUM_REQUIRED), $("#find_booking").disableButton())
            : alphaNumberValidation($("#vo_booking_no").val())
            ? ($("#bookingNoError").html(UIERRORS.EMPTY), $("#find_booking").enableButton())
            : ($("#bookingNoError").html(UIERRORS.BOOKING_NUM_ALPHA_NUMBER), $("#find_booking").disableButton()));
    "manageFirstName" == a && (alphaValidation($("#vo_manage_FirstName").val()) ? $("#manageFirstNameError").html(UIERRORS.EMPTY) : $("#manageFirstNameError").html(UIERRORS.FIRST_NAME_ALPHABETS));
    "manageLastName" == a && (alphaValidation($("#vo_manage_LastName").val()) ? $("#manageLastNameError").html(UIERRORS.EMPTY) : $("#manageLastNameError").html(UIERRORS.FIRST_NAME_ALPHABETS));
}
function getOtpForMangeBooking(a) {
    var b = $("#booking_no").val();
    a && (b = getSessionData("manageBookingId"));
    if (!b) return !1;
    commonPostCall(GlobalConstants.DOMAIN_URL + "/common/manageBookingUsingOtp", { cvNumber: b }, function (c) {
        !c || ("OK" != c.statusText && "success" != c.statusText)
            ? $("#invalidManageBookingID").show()
            : c.responseJSON && c.responseJSON.data && c.responseJSON.data.uniqueId
            ? (a
                  ? $("#manageBookingOtpText").html("OTP has been resent to your registered mobile \x26 email")
                  : ($("#manageBookingOtpDiv").addClass("show").removeClass("hide"),
                    $("#manageBookingForm").addClass("hide").removeClass("show"),
                    $("#invalidManageBookingID").hide(),
                    $("#manageBookingOtpText").html("Please enter OTP ", "X")),
              setSessionData("manageBookingId", b),
              setSessionData("manageBookingUniqueId", c.responseJSON.data.uniqueId),
              setSessionData("userType", c.responseJSON.data.userType))
            : ($("#invalidManageBookingID").show(), $("#invalidManageBookingID").html(API_ERROR[c.responseJSON.apiError]));
        $("#find_booking").enableButton();
    });
}
function getCVDetailsForManageBooking() {
    var a = getSessionData("manageBookingId"),
        b = getSessionData("userType"),
        c = {};
    c.leadId = getSessionData("manageBookingUniqueId");
    c.otp = $("#manage_booking_otp").val();
    http_post(
        GlobalConstants.DOMAIN_URL + "/common/manageBooking",
        function (b) {
            if (b && ("OK" == b.statusText || "success" == b.statusText))
                if ("failed" == b.responseJSON.status) $("#invalidManageOtp").show(), $("#invalidManageOtp").html(API_ERROR[b.responseJSON.apiError]);
                else if (($("#invalidManageOtp").hide(), setSessionData("bookingId", a), setSessionData("source", "manage"), "hsdUser" === getSessionData("userType"))) window.location = PAGE.hsdBookingConfirmation;
                else {
                    var c = b.responseJSON.data.PersonEmail;
                    b = b.responseJSON.data.Password__c;
                    setSessionData("CVNumber", a);
                    loginAsVOMember(c, b, callBackFunMemberLogin);
                }
        },
        { bookingNo: a, userType: b, vOLeadRegReq: c },
        "j"
    );
}
function getCVDetails() {
    setSessionData("bookingId", $("#vo_booking_no").val());
    setSessionData("FromManageBooking", !0);
    var a = $("#vo_booking_no").val(),
        b = session_get();
    a && b.isLoggedIn && b.user && (b.isLoggedIn && b.user && "CUSTOMER" == b.user.type ? getVOCV(a, b.user.current) : getHSDCV(a, b.user.id));
}
function getVOCV(a, b) {
    http_get(domainBaseUrl + GlobalConstants.URL.VO.GET_BOOKING + "?cvNumber\x3d" + a + "\x26contractId\x3d" + b, function (b) {
        b && "success" == b.responseJSON.status
            ? (setSessionData("CVNumber", a), setSessionData("source", "manage"), (window.location = PAGE.voBookingConfirmationPage))
            : display({ type: "ERROR", header: "Error", message: API_ERROR[b.responseJSON.apiError] });
    });
}
function getHSDCV(a, b) {
    http_get(GlobalConstants.DOMAIN_URL + "/hsd/booking/getByContract?cvNumber\x3d" + a + "\x26memberId\x3d" + b, function (b) {
        b && "success" == b.responseJSON.status
            ? (setSessionData("bookingId", a), setSessionData("source", "manage"), (window.location = PAGE.hsdBookingConfirmation))
            : display({ type: "ERROR", header: "Error", message: API_ERROR[b.responseJSON.apiError] });
    });
}
var bookNowVisibility = !0,
    div_top = 50;
$("#sticky-header") && $("#sticky-header").offset() && (div_top = $("#sticky-header").offset().top + 50);
function sticky_header() {
    $(window).scrollTop() > div_top
        ? ($("#bookNowNrml").hide(),
          $("#ha-header").removeClass("ha-header-subshow"),
          $("#ha-header").addClass("ha-header-show"),
          $("#sticky-header").height(0),
          $(".navbar-header .navbar-toggle").addClass("collapsed"),
          $("#sterling-navbar").addClass("collapse").removeClass("in"),
          $(".small-menu-not-logged-in").removeClass("visible-xs"),
          $(".lg-menu-not-logged-in").hide())
        : ($("#bookNowNrml").show(),
          $("#ha-header").removeClass("ha-header-show"),
          $("#ha-header").addClass("ha-header-subshow"),
          $("#sticky-header").height(0),
          $(".small-menu-not-logged-in").addClass("visible-xs"),
          $(".lg-menu-not-logged-in").show());
}
$(function () {
    $(window).scroll(sticky_header);
    sticky_header();
});
$(".logo").data("size", "big");
$(window).scroll(function () {
    1024 < $(window).width() &&
        ($(document).scrollTop() > div_top
            ? "big" == $(".logo").data("size") && ($(".logo").data("size", "small"), bookNowVisibility || $("#stickyBookNow").removeClass("booknow"))
            : "small" == $(".logo").data("size") && $(".logo").data("size", "big"));
});
var link = "",
    makeActive = function (a) {
        for (var b = "HOLIDAY EXPERIENCES;RESORTS \x26 DESTINATIONS;STERLING MEMBERSHIP;OFFERS \x26 PACKAGES;MEETINGS \x26 EVENTS;BLOG".split(";"), c = 0; c < b.length; c++)
            (link = b[c]), a === link && (setSessionData("selectedlink", link), getSessionData("selectedlink")), "" === a && setSessionData("selectedlink", "");
    },
    goTovoDashboard = function (a) {
        window.location = a && "undefined" != typeof a ? PAGE.voDashboard + a : PAGE.voDashboard;
    },
    goTovoFeedBackUrl = function (a) {
        window.location = a && "undefined" != typeof a ? PAGE.voDashboard + a : PAGE.voDashboard;
    },
    headLoggedInUserType = "";
function onBookNowClick() {
    sessionStorage.removeItem("SelectedpromoCode");
    sessionStorage.removeItem("SelectedpromoName");
    sessionStorage.removeItem("selectedPromoDetailsObj");
    sessionStorage.removeItem("selectedPromo");
    window.location = PAGE.hsdSearchPage;
}
$(function () {
    function a(a) {
        var b = "",
            c = "";
        a && (a.firstName && (b = a.firstName), a && a.lastName && (b += a.lastName), a.account && a.account.membershipDetails && a.account.membershipDetails.productPurchased && (c = a.account.membershipDetails.productPurchased));
        $("#header-prof-userName").html(b);
        $("#header-prof-productPurchased").html(c);
    }
    function b() {
        $(".userType_USER_VO_js").remove();
        $(".userType_USER_HSD_js").remove();
    }
    $(".member-login-via-email-div").hide();
    $(".member-login-via").on("click", function () {
        "email" == $(this).val()
            ? ($("#memberFormMailError").html(UIERRORS.EMPTY),
              $(".member-login-via-mobile-div").hide(),
              $(".member-login-via-email-div").show(),
              $("#memberMobile").val(""),
              $("#signInAsMember").disableButton(),
              $("#otp-icon-email-label").removeClass("icon-otp-login-email"),
              $("#otp-icon-email-label").addClass("icon-otp-login-email-green"),
              $("#otp-icon-mob-label").removeClass("icon-otp-login-mobile-green"),
              $("#otp-icon-mob-label").addClass("icon-otp-login-mobile"))
            : ($("#memberFormMobileError").html(UIERRORS.EMPTY),
              $(".member-login-via-email-div").hide(),
              $(".member-login-via-mobile-div").show(),
              $("#memberEmail").val(""),
              $("#signInAsMember").disableButton(),
              $("#otp-icon-mob-label").removeClass("icon-otp-login-mobile"),
              $("#otp-icon-mob-label").addClass("icon-otp-login-mobile-green"),
              $("#otp-icon-email-label").removeClass("icon-otp-login-email-green"),
              $("#otp-icon-email-label").addClass("icon-otp-login-email"));
    });
    console.log("sessionData");
    var c = session_get();
    console.log(c);
    c && c.user && c.user.userType
        ? ($(".userlogged_js").show(),
          $(".user_not_logged_js").remove(),
          "Non_Member__c" == c.user.userType || "CUSTOMER" == c.user.userType
              ? ((headLoggedInUserType = c.user.userType),
                "Non_Member__c" == c.user.userType
                    ? ($(".userType_USER_HSD_js").show(),
                      $(".userType_USER_VO_js").remove(),
                      c.user.profile &&
                          (c.user.profile.profileImage
                              ? ($("#header-prof-altprofileImagePath").remove(), $("#header-prof-profileImagePath").show())
                              : ($("#header-prof-profileImagePath").remove(), $("#header-prof-altprofileImagePath").show()),
                          a(c.user.profile)))
                    : "CUSTOMER" == c.user.userType &&
                      ($(".userType_USER_VO_js").show(),
                      $(".userType_USER_HSD_js").remove(),
                      c.user.contracts &&
                          c.user.contracts[0] &&
                          (c.user.contracts[0].profileImage
                              ? ($("#header-prof-altprofileImagePath").remove(), $("#header-prof-profileImagePath").show())
                              : ($("#header-prof-profileImagePath").remove(), $("#header-prof-altprofileImagePath").show()),
                          a(c.user.contracts[0]))))
              : b())
        : ($(".userlogged_js").remove(), $(".user_not_logged_js").show(), b());
    (c = $(".carousel-fade").height()) && $(".banner-text-panel").css({ "margin-top": c / 3 });
});
var profileMenuVisible = !1,
    toggleProfileMenu = function () {
        "CUSTOMER" != headLoggedInUserType
            ? ($("#accountCollapse-normal").slideToggle(), (profileMenuVisible = !profileMenuVisible))
            : $(".acc-details").hasClass("active-acc")
            ? ($("#sticky-anchor").css({ height: "78px", "-webkit-transition": "opacity 0.4s ease-in-out" }),
              (profileMenuVisible = !1),
              $("#accountCollapse-vo").slideToggle(),
              $(".vobookingBlock,.timer-notification").addClass("sticked"),
              $("main").removeClass("accDtls-opened"))
            : ($("#accountCollapse-normal").slideToggle(),
              (profileMenuVisible = !0),
              $(".vobookingBlock,.timer-notification,.layout").removeClass("sticked"),
              $("#sticky-anchor").css({ height: "78px", "-webkit-transition": "opacity 0.4s ease-in-out" }),
              $("main").addClass("accDtls-opened"));
    },
    goToDashboard = function (a) {
        window.location = a && "undefined" != typeof a ? PAGE.hsdDashboard + a : PAGE.hsdDashboard;
    },
    showDashboard = function () {
        768 > window.innerWidth && $(".xs-menu").fadeToggle();
    },
    deleteFromSession = function (a) {
        delete sessionStorage[a];
    },
    signout = function () {
        var a = session_get();
        if (a.isLoggedIn) {
            var b = JSON.stringify({ email: a.user.email });
            $.ajax({ url: domainBaseUrl + "/logout", method: "POST", data: b }).done(function () {
                a &&
                    a.user &&
                    "LEAD" == a.user.userType &&
                    (deleteFromSession("transactionId"),
                    deleteFromSession("voDownPaymentAmount"),
                    deleteFromSession("voDownPaymentPercent"),
                    deleteFromSession("voemiMonths"),
                    deleteFromSession("voSelectedPlan"),
                    deleteFromSession("paymentAmt"),
                    deleteFromSession("saleIdInKYC"));
                window.location.href = PAGE.index;
            });
        }
        a.isLoggedIn || (window.location.href = PAGE.index);
        clear();
        setSessionData("toggleManageBooking", !1);
    };
$("#landing-hero-carousel img").on("load", function () {
    var a = $(".carousel-fade").height();
    $(".banner-text-panel").css({ "margin-top": a / 3 });
});
function showPosition(a) {
    origin1 = { lat: parseFloat(a.coords.latitude), lng: parseFloat(a.coords.longitude) };
    setSessionData("currentLocation", JSON.stringify(origin1));
}
function getLocation() {
    navigator.geolocation ? navigator.geolocation.getCurrentPosition(showPosition) : ((origin1 = { lat: 13.0827, lng: 80.2707 }), setSessionData("currentLocation", JSON.stringify(origin1)));
}
var currentLatnLong = getSessionData("currentLocation");
null == currentLatnLong && getLocation();
function signInModal(a) {
    a || (clearAuthenticationForm(), $("#modal-authentication").modal("show"));
}
function clearAuthenticationForm() {
    $("#member_form_username").val(UIERRORS.EMPTY);
    $("#member_form_password").val(UIERRORS.EMPTY);
    $("#memberFormEmailError").html(UIERRORS.EMPTY);
    $("#memberEmail").val(UIERRORS.EMPTY);
    $("#memberFormMailError").html(UIERRORS.EMPTY);
    $("#memberFormPasswordError").html(UIERRORS.EMPTY);
    $("#memberLoginError").html(UIERRORS.EMPTY);
    $("#memberID").val(UIERRORS.EMPTY);
    $("#memberPassword").val(UIERRORS.EMPTY);
    $("#memberEmailError").html(UIERRORS.EMPTY);
    $("#memberPasswordError").html(UIERRORS.EMPTY);
    $("#invalidMemberPasswordError").html(UIERRORS.EMPTY);
    $("#loginBtn").disableButton();
    $("#memberMobile").val(UIERRORS.EMPTY);
    $("#memberFormMobileError").html(UIERRORS.EMPTY);
    $("#memberEmail").val("");
    $(".member-login-via").prop("checked", !1);
    $(".member-login-via:first").prop("checked", !0);
    $("#otp-icon-mob-label").removeClass("icon-otp-login-mobile");
    $("#otp-icon-mob-label").addClass("icon-otp-login-mobile-green");
    $("#otp-icon-email-label").removeClass("icon-otp-login-email-green");
    $("#otp-icon-email-label").addClass("icon-otp-login-email");
    $(".member-login-via-mobile-div").show();
    $(".member-login-via-email-div").hide();
    $("#signInAsMember").disableButton();
    $("#memberOTP").val(UIERRORS.EMPTY);
    $(".memberMobileNum").html(UIERRORS.EMPTY);
    $("#memberFormOTPError").html(UIERRORS.EMPTY);
    $("#submitMemberOTP").disableButton();
    $("#submitMemberOTP2").disableButton();
    $("#guest_form_username").val(UIERRORS.EMPTY);
    $("#guest_form_password").val(UIERRORS.EMPTY);
    $("#errorMsg_guest_email").html(UIERRORS.EMPTY);
    $("#errorMsg_guest_password").html(UIERRORS.EMPTY);
    $("#signInAsGuest").disableButton();
    $("#forgotemailId").val(UIERRORS.EMPTY);
    $("#forgotEmailError").html(UIERRORS.EMPTY);
    $("#invalidEmailResetPwd").html(UIERRORS.EMPTY);
    $("#individual_signupform_firstname").val(UIERRORS.EMPTY);
    $("#individual_signupform_lastname").val(UIERRORS.EMPTY);
    $("#individual_signupform_mobile").val(UIERRORS.EMPTY);
    $("#individual_signupform_email").val(UIERRORS.EMPTY);
    $("#individual_signupform_password").val(UIERRORS.EMPTY);
    $("#individual_signupform_confirmpassword").val(UIERRORS.EMPTY);
    $("#guestFirstNameError").html(UIERRORS.EMPTY);
    $("#guestLastNameError").html(UIERRORS.EMPTY);
    $("#guestPhoneNumberError").html(UIERRORS.EMPTY);
    $("#guestEmailError").html(UIERRORS.EMPTY);
    $("#guestPasswordError").html(UIERRORS.EMPTY);
    $("#guestConfirmpasswordError").html(UIERRORS.EMPTY);
    $("#guestSignUpBtn").disableButton();
    $("#individual_signupform_otp").val(UIERRORS.EMPTY);
    $("#errorMsg_otp").html(UIERRORS.EMPTY);
    $("#submitIndividualSignupForm").disableButton();
    $("#chOtp").val(UIERRORS.EMPTY);
    $("#chNewPswd").val(UIERRORS.EMPTY);
    $("#chNewPswdCnfrm").val(UIERRORS.EMPTY);
    $("#chForgotOtpError").html(UIERRORS.EMPTY);
    $("#chForgotNewPswdError").html(UIERRORS.EMPTY);
    $("#chForgotNewPswdCnfrmError").html(UIERRORS.EMPTY);
    $("#chInvalidOtp").html(UIERRORS.EMPTY);
    $("#otp").val(UIERRORS.EMPTY);
    $("#currentPswd").val(UIERRORS.EMPTY);
    $("#newPswd").val(UIERRORS.EMPTY);
    $("#newPswdCnfrm").val(UIERRORS.EMPTY);
    $("#chForforgotOtpMembergotOtpError").html(UIERRORS.EMPTY);
    $("#forgotCurrentPswdMember").html(UIERRORS.EMPTY);
    $("#newPswdError").html(UIERRORS.EMPTY);
    $("#newPswdCnfrmError").html(UIERRORS.EMPTY);
    $("#resetPwdServiceError").html(UIERRORS.EMPTY);
    $("#invalidOtp").html(UIERRORS.EMPTY);
    $("#memberLoginForm1").show();
    $("#memberLoginForm2").hide();
    $("#quickPaySection").hide();
    $("#quickPayCheckBox").removeAttr("checked");
    $("#showRegister").show();
    $("#isOTPResent").hide();
    $("#showOtpToRegister").hide();
    removePromo();
    isOfferAvaild = !1;
    $(".days-exceed-alert").hide();
    $("#bookingDateError").hide();
    $("#bookingDateError").text("");
}
$(window).on("scroll", function () {
    100 < $(window).scrollTop()
        ? $("#go2top").fadeIn()
        : $("#go2top").fadeOut(function () {
              $("#go2top").removeClass("hover");
          });
});
$("#go2top").on("mouseover touchstart", function (a) {
    $(this).addClass("hover");
});
$("#go2top").on("mouseout touchend", function (a) {
    $(this).removeClass("hover");
});
goToTop = function () {
    $("html, body").animate({ scrollTop: 0 }, "slow");
};
var key = "sterling-session";
function session_set(a) {
    localStorage.setItem(key, SterlEncrypto2017.encode(JSON.stringify(a)));
}
function session_get() {
    if (isSessionEmpty()) return !1;
    var a = JSON.parse(SterlEncrypto2017.decode(localStorage.getItem(key)));
    a && a.user && "CUSTOMER" == a.user.type && ((a.user.contracts[0].firstName = getItem("voUserFirstName")), (a.user.contracts[0].lastName = getItem("voUserLastName")));
    return a;
}
function isSessionEmpty() {
    return null === localStorage.getItem(key) ? !0 : !1;
}
function setItem(a, b) {
    localStorage.setItem(a, b);
}
function getItem(a) {
    return localStorage.getItem(a);
}
function clear() {
    session_set({ isLoggedIn: !1, guestSession: {} });
}
function deleteSession(a) {
    localStorage.removeItem(a);
    sessionStorage.removeItem(a);
}
$(document).ready(function () {
    getOfferOftheDayData();
});
function getOfferOftheDayData() {
    getData(GlobalConstants.URL.HSD.GET_VALID_PROMOS, setOfferOftheDayData);
}
function goToOffersDayPage(a) {
    window.location = PAGE.offersAndPackages + "#/offers?promoName\x3d" + a;
}
function setOfferOftheDayData(a) {
    a = a.responseJSON;
    var b = function (a) {
        var b = a.imageThumbnail;
        return (
            '\x3cdiv class\x3d"item promoi" \x3e\x3cdiv class\x3d"over-img"\x3e\n\n                 \x3cpicture\x3e\n                              \x3csource media\x3d"(max-width: 420px)" data-srcset\x3d"' +
            b +
            '"\x3e\n                              \x3csource media\x3d"(min-width: 421px)" data-srcset\x3d"' +
            b +
            '"\x3e\n                              \x3cimg class\x3d"lazyload" data-src\x3d"' +
            b +
            '"  alt\x3d"Offer Image" \x3e\n                           \x3c/picture\x3e\n                    \x3cdiv class\x3d"img-overlay"\x3e\x3c/div\x3e\n              \t\x3c/div\x3e\n              \t\x3cdiv class\x3d"over-btn"\x3e\n                 \t\x3ca class\x3d"btn btn-mob book-btn ' +
            a.promoClass +
            '" href\x3d' +
            a.url +
            '\x3eAvail the offer\x3c/a\x3e\n\n              \t\x3c/div\x3e\n                \x3cdiv class\x3d"row"\x3e\n                \t\x3cdiv class\x3d"over-content col-xs-12"\x3e\n                    \t\x3cdiv class\x3d"pdlr-15"\x3e \n                        \t\x3ch3 class\x3d"large_plus_text"\x3e\x3ci class\x3d"ng-binding"\x3e' +
            a.promoName +
            '\x3c/i\x3e\x3c/h3\x3e\n                            \t\x3ci\x3e\x3cspan class\x3d"ng-binding"\x3e' +
            a.promoMsg +
            "\x3c/span\x3e\x3c/i\x3e\n                        \x3c/div\x3e\n                   \x3c/div\x3e\n               \x3c/div\x3e\x3c/div\x3e"
        );
    };
    if (a)
        if (((offerData = []), 0 < a.length)) {
            for (var c = 0; c < a.length; c++)
                if (((a[c].url = encodeURI(PAGE.offersAndPackages + "#/offers?promoName\x3d" + a[c].promoName)), (a[c].promoClass = "secondary-link"), a[c].promoForLoggedin && "true" == a[c].promoForLoggedin)) {
                    var d = session_get();
                    d && d.isLoggedIn && offerData.push({ url: a[c].url, imageThumbnail: a[c].body.imageThumbnail, promoClass: a[c].promoClass, promoName: a[c].promoName, promoMsg: a[c].body.promoMsg });
                } else offerData.push({ url: a[c].url, imageThumbnail: a[c].body.imageThumbnail, promoClass: a[c].promoClass, promoName: a[c].promoName, promoMsg: a[c].body.promoMsg });
            a = offerData.map(b).join("");
            $("#promo-carousel").html(a);
            $("#promo-carousel").owlCarousel({ navigation: !0, items: 3, itemsDesktop: [1199, 3], itemsDesktopSmall: [979, 3] });
        } else $("#promoOfferOftheDay").hide(), $("#noOfferOfTheDay").show();
    else $("#promoOfferOftheDay").hide(), $("#noOfferOfTheDay").show();
}
$(function () {
    var a = $(window).width();
    $(".lazy").Lazy({
        effect: "fadeIn",
        effectTime: 1e3,
        threshold: 0,
        afterLoad: function (b) {
            if ("" != b.attr("data-original") && void 0 != b.attr("data-original"))
                if ((b.attr("src", ""), 480 >= a)) {
                    var c = b.attr("data-original") + ".imgt.480.485.png";
                    b.attr("src", c);
                } else
                    768 >= a && 480 < a
                        ? ((c = b.attr("data-original") + ".imgt.768.485.png"), b.attr("src", c))
                        : 992 >= a && 768 < a
                        ? ((c = b.attr("data-original") + ".imgt.992.600.png"), b.attr("src", c))
                        : 1280 >= a && 992 < a
                        ? ((c = b.attr("data-original") + ".imgt.1280.600.png"), b.attr("src", c))
                        : ((c = b.attr("data-original") + ".imgt.1366.600.png"), b.attr("src", c));
        },
    });
    $(".lazy-loader").Lazy({ effect: "fadeIn", effectTime: 1e3, threshold: 0, placeholder: "data:image/gif;base64,R0lGODlhEALAPQAPzl5uLr9Nrl8e7..." });
});
var media_events = [];
media_events.loadstart = 0;
media_events.play = 0;
media_events.pause = 0;
var media_properties = "error src srcObject currentSrc crossOrigin networkState preload buffered readyState seeking currentTime duration paused defaultPlaybackRate playbackRate played seekable ended autoplay loop controls volume muted defaultMuted audioTracks videoTracks textTracks width height videoWidth videoHeight".split(
        " "
    ),
    media_properties_elts = null;
function init() {
    media_properties_elts = Array(media_properties.length);
}
document.addEventListener("DOMContentLoaded", init, !1);
function capture(a) {
    media_events[a.type]++;
}
function startVideo() {
    var a = document.getElementById("carouselLength").innerHTML;
    setTimeout(function () {
        for (var b = 0; b <= a; b++) {
            var c = "indicator".concat(b);
            $("li#" + c).hasClass("active") ? $("#video" + b).length && document.getElementById("video" + b).play() : $("#video" + b).length && document.getElementById("video" + b).pause();
        }
    }, 1e3);
}
function applyPromoForResortBooking(a, b, c) {
    $(".chkfld").css({ "margin-top": "30px" });
    a && Session.setSessionData("filename", a.filename);
    $("#hsdCheckInDate").val("");
    $("#hsdCheckOutDate").val("");
    $("#chkAvb").attr("disabled", !0);
    $("#promoResort").modal("hide");
    $("#sameDateErrorMsg").hide();
    $("#hsdCheckInDate").attr("disabled", !1);
    $("#hsdCheckOutDate").attr("disabled", !1);
    setSessionData("selectedPromo", b);
    setSessionData("SelectedpromoCode", b.promoCode);
    setSessionData("SelectedpromoName", b.promoName);
    setSessionData("promoCodeValue", b.promoCode);
    setSessionData("selectedPromoDetailsObj", b.body);
    setPromoText(b);
    var d = [];
    $.each(b.body.mappedResortsArray, function (a, b) {
        a = !1;
        for (var e = 0; e < d.length; e++)
            if (d[e].value == b.masterName) {
                a = !0;
                break;
            }
        a || (c && -1 < c.indexOf(b.sfResortID) ? d.push({ value: b.masterName }) : c || d.push({ value: b.masterName }));
    });
    filterDestination(d);
    window.location.href.includes(PAGE.destinationPage) && $("#selectedDestination1").val(d[0].value);
    b && b.desResortArr && 0 < b.desResortArr.length && (setSessionData("isFromDestinationOffer", !0), setSelectedResortAtBooking(b.desResortArr, !1));
    var e = b.body.staystartDate.split("/"),
        f = b.body.stayendDate.split("/");
    e = new Date(e[2], e[0] - 1, e[1]);
    var k = new Date(f[2], f[0] - 1, f[1]);
    f = new Date(k);
    f.setDate(f.getDate() - 1);
    var h = new Date();
    e < h && (e = h);
    h = moment();
    for (var g = 0; g < b.body.blackoutDates.length; g++)
        if (moment(b.body.blackoutDates[g]).format("YYYY-MM-DD") >= moment(h).format("YYYY-MM-DD") && moment(b.body.blackoutDates[g]).format("YYYY-MM-DD") == moment(e).format("YYYY-MM-DD"))
            for (e.setDate(e.getDate() + 1), g = 0; g < b.body.blackoutDates.length; g++)
                if (moment(b.body.blackoutDates[g]).format("YYYY-MM-DD") >= moment(h).format("YYYY-MM-DD") && moment(b.body.blackoutDates[g]).format("YYYY-MM-DD") == moment(e).format("YYYY-MM-DD")) {
                    e.setDate(e.getDate() + 1);
                    break;
                }
    "EB-R" == b.promoTypeID && b.body.bookingWindow
        ? "days" == b.body.bookingWindowDiffType && ((h = Number(b.body.bookingWindow)), e.setDate(e.getDate() + h))
        : "LM-R" == b.promoTypeID && b.body.bookingWindow && "days" == b.body.bookingWindowDiffType && ((h = Number(b.body.bookingWindow)), (k = new Date(e)), k.setDate(k.getDate() + (h - 1)), (f = new Date(k)), (k = new Date(k)));
    $("#hsdCheckInDate").datepicker("setStartDate", e);
    $("#hsdCheckInDate").datepicker("setEndDate", f);
    $("#hsdCheckOutDate").datepicker("setStartDate", $("#hsdCheckInDate").val());
    $("#hsdCheckOutDate").datepicker("setEndDate", k);
    $(".booking-tabs .nav-tabs,  #defaultRecommendation").slideUp();
    $(".selection-inputs.dropdown-menu").css({ display: "" });
    $("#ebo").hide();
    a &&
        ($("#selectedDestination1").val(a.masterName),
        $("#selectedDestination1").attr("disabled", !0),
        setSessionData("resortID", a.resortID),
        setSessionData("logo", a.resortpicture),
        setSessionData("resortBannerImage", a.heroImage),
        setSessionData("filename", a.filename),
        setSessionData("roomInfo", a.roomInfo));
    $(".popup-booknow-field2").removeClass("packageSelected");
    $(".popup-booknow-field2").css({ color: "" });
    $("#multiBook,#booking-widget-display").slideUp();
    $("#promoTextContainer").slideDown();
    $("#promoText").text(b.promoName);
    b && b.body && b.body.minimumNights && ((isOfferAvaild = !0), setSessionData("offerMinDate", b.body.minimumNights));
}
function setPromoText(a) {
    $("#promoTextContainer").css("visibility", "visible");
    $("#promoTextContainerResultWidget").css("visibility", "visible");
    a = "%" == a.body.discountType ? (a.promoName + " " + a.body.discountValue + "%").toString() : "INR" == a.body.discountType ? (a.promoName + " INR " + a.body.discountValue).toString() : a.promoName.toString();
    $("#promoText").text(a);
    $("#promoTextResultWidget").text(a);
    isOfferAvaild = !1;
    deleteSession("offerMinDate");
}
function filterDestination(a) {
    initializeTypeAhead(a);
}
function initializeTypeAhead(a) {
    var b = new Bloodhound({
        initialize: !1,
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace("value"),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        identify: function (a) {
            return a.value;
        },
        local: a,
        limit: a.length,
    });
    b.initialize();
    var c = function (a, c) {
        "" === a ? c(b.all()) : b.search(a, c);
    };
    $("#default-datasets .typeahead").typeahead("destroy");
    $("#default-datasets .typeahead").typeahead(
        { minLength: 0, maxItem: a.length, hint: !1, highlight: !0 },
        {
            name: "Mutual-funds",
            display: "value",
            offset: !1,
            source: c,
            limit: a.length,
            templates: {
                empty: '\x3cdiv class\x3d"empty-message" id\x3d"empty-message"\x3e\nNo Destination Found\n\x3c/div\x3e',
                suggestion: Handlebars.compile(
                    '\x3cdiv\x3e\x3cdiv class\x3d"dest-resort"\x3e\x3cstrong\x3e{{destination}}\x3c/strong\x3e \x3cspan\x3e{{value}}\x3c/span\x3e\x3c/div\x3e \x3cdiv class\x3d"type"\x3e{{type}}\x3c/div\x3e\x3c/div\x3e'
                ),
            },
        }
    );
    $("#circular-datasets .typeahead").typeahead("destroy");
    $("#circular-datasets .typeahead").typeahead(
        { minLength: 0, maxItem: a.length, hint: !1, highlight: !0 },
        {
            name: "Mutual-funds",
            display: "value",
            offset: !1,
            source: c,
            limit: a.length,
            templates: {
                empty: '\x3cdiv class\x3d"empty-message" id\x3d"empty-message"\x3e\nNo Destination Found\n\x3c/div\x3e',
                suggestion: Handlebars.compile(
                    '\x3cdiv\x3e\x3cdiv class\x3d"dest-resort"\x3e\x3cstrong\x3e{{destination}}\x3c/strong\x3e \x3cspan\x3e{{value}}\x3c/span\x3e\x3c/div\x3e \x3cdiv class\x3d"type"\x3e{{type}}\x3c/div\x3e\x3c/div\x3e'
                ),
            },
        }
    );
}
function removePromo() {
    deleteFromSession("SelectedpromoCode");
    deleteFromSession("SelectedpromoName");
    deleteFromSession("promoCodeValue");
    deleteFromSession("selectedPromoDetailsObj");
    deleteFromSession("selectedPromo");
    deleteFromSession("SelectedpromoDiscountVal");
    deleteSession("isFromDestinationOffer");
    setSelectedResortAtBooking([], !0);
    $("#singleDestination").val("");
    $(".popup-booknow-field2").removeClass("packageSelected");
    $("#selectedDestination1").attr("disabled", !1);
    $(".booking-tabs .nav-tabs,  #defaultRecommendation").slideDown();
    $(".chkfld").css({ "margin-top": "0px" });
    var a = new Date();
    a.setDate(a.getDate() + 0);
    var b = new Date();
    b.setDate(120 - b.getDate());
    b.setFullYear(b.getFullYear());
    $("#hsdCheckInDate").datepicker("setStartDate", new Date(a));
    $("#hsdCheckInDate").datepicker("setEndDate", new Date(b));
    $("#hsdCheckOutDate").datepicker("setStartDate", new Date(a));
    $("#hsdCheckOutDate").datepicker("setEndDate", new Date(b));
    $("#multiBook,#booking-widget-display").slideDown();
    $("#promoTextContainer").slideUp();
    $("#promoText").text("");
}
function setSelectedResortAtBooking(a, b) {
    b && (a = RESORTDATA);
    var c = new Bloodhound({
        initialize: !1,
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace("value"),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        identify: function (a) {
            return a.value;
        },
        local: a,
        limit: a.length,
    });
    c.initialize();
    $("#singleDestination.typeahead").typeahead("destroy");
    $("#singleDestination.typeahead").typeahead(
        { minLength: 0, maxItem: a.length, hint: !1, highlight: !0 },
        {
            name: "states",
            display: "value",
            offset: !1,
            source: function (a, b) {
                "" === a ? b(c.all()) : c.search(a, b);
            },
            limit: a.length,
            templates: {
                empty: '\x3cdiv class\x3d"empty-message" id\x3d"empty-message"\x3e\nNo Destination1 Found\n\x3c/div\x3e',
                suggestion: Handlebars.compile(
                    '\x3cdiv\x3e\x3cdiv class\x3d"dest-resort"\x3e\x3cstrong\x3e{{destination}}\x3c/strong\x3e \x3cspan\x3e{{value}}\x3c/span\x3e\x3c/div\x3e \x3cdiv class\x3d"type"\x3e{{type}}\x3c/div\x3e\x3c/div\x3e'
                ),
            },
        }
    );
    $("#singleDestination").val(a[0].value);
}
$("#resortLink").attr("href", PAGE.resort);
var userType = getSessionData("userType"),
    cur_session = session_get();
cur_session && cur_session.isLoggedIn && cur_session.user && "CUSTOMER" == cur_session.user.userType
    ? ($("#hsdRoomsShow").remove(),
      $("#isNotloginForRooms").remove(),
      $("#isHsdFlowBkBtn").remove(),
      $("#inRoomAmenitiesForHSD").remove(),
      cur_session.user.contracts[0] &&
      cur_session.user.contracts[0].account &&
      cur_session.user.contracts[0].account.membershipDetails &&
      ("TimeShare" == cur_session.user.contracts[0].account.membershipDetails.recordType || cur_session.user.contracts[0].account.membershipDetails.recordType.includes("TimeShare"))
          ? ($(".isTimeShareCusShow").show(), $(".isNotTimeShareCusShow").remove())
          : ($(".isTimeShareCusShow").remove(), $(".isNotTimeShareCusShow").show()))
    : ($("#voRoomsShow").remove(), $("#isloginForRooms").remove(), $("#isNotHsdFlowBkBtn").remove(), $("#inRoomAmenitiesForVO").remove());
-1 == window.location.href.indexOf("package-result")
    ? (setSessionData("packageApplied", !1), setSessionData("promoApplied", !1))
    : cur_session.isLoggedIn() && cur_session.user && ("SALE" == cur_session.user.userType || "LEAD" == cur_session.user.userType) && $("#resortHeaderBookNowBtn").remove();
generateRoomName = function (a) {
    alert(a);
    var b = "";
    a && ((b = a.replace(/\s+/g, "-")), (b = b.replace("-", "-view-", 1).toLowerCase()));
    return b;
};
function setCurrentRoomHSD(a) {}
$(".view-details").click(function () {
    var a = $(this).attr("data-room-type");
    $("." + a).modal("show");
});
$(".bookThisRoomBtn").click(function () {
    var a = $(this).attr("data-room-modal"),
        b = $(this).attr("data-room-name"),
        c = $(this).attr("data-room-id"),
        d = $(this).attr("data-resort-log");
    $("." + a).modal("hide");
    setSessionData("resortName", b);
    if ((a = session_get()) && a.isLoggedIn && "CUSTOMER" == a.user.type) setSessionData("filename", b);
    else if (
        ($("#sameDateErrorMsg").hide(),
        $("#selectedDestination1").val(""),
        $("#startDate1").val(""),
        $("#endDate1").val(""),
        (a = new Date()),
        a.setDate(a.getDate() + 1),
        $("#datepickerBooking").datepicker("remove"),
        $("#datepickerBooking").datepicker({ container: "#picker-container", startDate: a, toggleActive: !1, todayBtn: !1, keepEmptyValues: !0, todayHighlight: !0, autoApply: !1, orientation: "top", format: "M d, yyyy" }),
        b)
    ) {
        $("#singleDestination .typeahead").typeahead("val", b);
        $("#singleDestination .typeahead").trigger("typeahead:selected", { value: b });
        setSessionData("resortID", c);
        c = getSessionData("masterNameAndResortId");
        a = getSessionData("rsrtsFileName");
        for (var e = "", f = 0; f < c.length; f++) c[f].masterName == b && (e = a[f]);
        e ? setSessionData("filename", e) : setSessionData("filename", filterResort(b).filename);
        setSessionData("logo", d);
    }
});
$(".vo-view-details").click(function () {
    var a = $(this).attr("data-room-type");
    $("." + a).modal("show");
});
$(".overview-modal").on("hide.bs.modal", function () {
    $(".roomdetails-carousel").carousel(0);
});
$(".roomDetailsCarousel").on("slide.bs.carousel", function () {
    if ($(".roomDetailsCarousel .item").hasClass("active")) {
        var a = $(this).find(".item.active").attr("data-carousel-index"),
            b = $(this).find(".item.active").attr("data-roomId");
        $("#carouselCount" + b).text(a);
    }
});
function sticky_relocate() {
    var a = $(window).scrollTop();
    if (0 < $("#sticky-anchor").length) {
        var b = $("#sticky-anchor").offset().top - 65;
        a > b ? ($("#sticky").addClass("stick"), $("#sticky-anchor").height($("#sticky").outerHeight())) : ($("#sticky").removeClass("stick"), $("#sticky-anchor").height(0));
    }
}
$(function () {
    $(window).scroll(sticky_relocate);
    sticky_relocate();
});
$(document).ready(function () {
    $(document).on("scroll", onScroll);
    $(document).on("click", '.redirection-menu a[href^\x3d"#"]', function (a) {
        a.preventDefault();
        $(document).off("scroll");
        $(".redirection-menu a").each(function () {
            $(this).removeClass("anchor-active");
        });
        $(this).hasClass("genericbtn") || $(this).addClass("anchor-active");
        a = $(".redirection-menu").hasClass("tab-scroll-off");
        var b = this.hash,
            c = $("#sticky-anchor").offset().top - 65;
        a || (c = $(b).offset().top - 120);
        $("html, body").animate({ scrollTop: c }, 800, function () {
            location.hash.replace("#", "");
            $(document).on("scroll", onScroll);
        });
    });
});
function onScroll(a) {
    var b = $(document).scrollTop() + 200;
    $(".redirection-menu").hasClass("tab-scroll-off") ||
        $(".redirection-menu a").each(function () {
            var a = $(this),
                d = $(a.attr("href"));
            d.position() && d.position().top <= b && d.position().top + d.height() > b
                ? ($(".redirection-menu ul li a").removeClass("anchor-active"), $(this).hasClass("genericbtn") || a.addClass("anchor-active"))
                : a.removeClass("anchor-active");
        });
}
var VOLandingMember = {};
$(document).ready(function () {
    getCountries("voCountry", "");
    $(document).on("click", ".countries-vo .dropdown-menu.inner li", function () {
        updateState();
    });
    $(document).on("click", ".states-vo .dropdown-menu.inner li", function () {
        updateCity();
    });
    $(document).on("click", ".agegroup-class .dropdown-menu.inner li", function () {
        setActiveClass("#agegroupLabel");
    });
    $(document).on("click", ".education-class .dropdown-menu.inner li", function () {
        setActiveClass("#HighestEducationLabel");
    });
    $(document).on("click", ".children-class .dropdown-menu.inner li", function () {
        setActiveClass("#childrenLabel");
    });
    $(document).on("click", ".monthlyIncome-class .dropdown-menu.inner li", function () {
        setActiveClass("#monthlyincomeLabel");
    });
    $(document).on("click", ".creditCard-class .dropdown-menu.inner li", function () {
        setActiveClass("#creditcardLabel");
    });
    $(document).on("click", ".carOwned-class .dropdown-menu.inner li", function () {
        setActiveClass("#carLabel");
    });
    $(document).on("click", "#voSubmit", function () {
        saveMemberInfo();
    });
    $(document).on("blur", "#vofName", function () {
        validateMemberShipform("fname");
    });
    $(document).on("blur", "#volName", function () {
        validateMemberShipform("lname");
    });
    $(document).on("blur", ".agegroup-class .dropdown-menu.inner li", function () {
        validateMemberShipform("age");
    });
    $(document).on("blur", "#voMobile", function () {
        validateMemberShipform("mobile");
    });
    $(document).on("blur", "#voEmail", function () {
        validateMemberShipform("email");
    });
    $(document).on("blur", ".countries-vo .dropdown-menu.inner li", function () {
        validateMemberShipform("country");
    });
    $(document).on("blur", ".states-vo .dropdown-menu.inner li", function () {
        validateMemberShipform("state");
    });
    $(document).on("blur", ".cities-vo .dropdown-menu.inner li", function () {
        validateMemberShipform("city");
    });
    $(document).on("blur", "#voAddress", function () {
        validateMemberShipform("address");
    });
    $(document).on("blur", "#voPin", function () {
        validateMemberShipform("pin");
    });
    $(document).on("click", "#chkall", function () {
        knowMoreTACCheckBok("chkall", "voSubmit");
    });
});
$("#voMobile,#voPin").keypress(function (a) {
    if (8 != a.which && 0 != a.which && (48 > a.which || 57 < a.which)) return !1;
});
$(".additional-info-plus").click(function () {
    $(this).toggleClass("additional-info-minus");
    $(".call-back-section").slideToggle();
    $(this).text(function (a, b) {
        return "Provide additional information" === b ? "Hide additional information" : "Provide additional information";
    });
});
function updateState() {
    $(".countries-vo .filter-option").css("opacity", 1);
    $("#countryLabel").addClass("fl-active");
    var a = $("#voCountry").val();
    if (a && "India" != a) return $("#voStateDiv").hide(), $("#voCityDiv").hide(), "";
    $("#voStateDiv").show();
    $("#voCityDiv").show();
    a && "Select Country" != a && (setStates("voState", "cities-vo"), $(".states-vo .filter-option").css("opacity", 1), $("#stateLabel").addClass("fl-active"));
}
function updateCity() {
    var a = $("#voState").val();
    a && "Select State" != a && (setCities("voState", "voCity", a), $(".cities-vo .filter-option").css("opacity", 1), $("#cityLabel").addClass("fl-active"));
}
function validateMemberShipform(a) {
    var b = !0;
    if ("fname" == a || "All" == a) {
        var c = $("#vofName"),
            d = $("#voMemberFirstNameError");
        c.isEmpty() ? (d.html(UIERRORS.FIRST_NAME_REQUIRED), (b = !1)) : d.html(UIERRORS.EMPTY);
    }
    if ("lname" == a || "All" == a) (c = $("#volName")), (d = $("#voMemberLastNameError")), c.isEmpty() ? (d.html(UIERRORS.LAST_NAME_REQUIRED), (b = !1)) : d.html(UIERRORS.EMPTY);
    if ("age" == a || "All" == a) (c = $("#voAge")), (d = $("#voMemberAgeGroupError")), c.isEmpty() ? (d.html(UIERRORS.AGE_GROUP), (b = !1)) : d.html(UIERRORS.EMPTY);
    if ("mobile" == a || "All" == a) {
        c = $("#voMobile");
        var e = c.val();
        d = $("#voMemberPhoneNumberError");
        c.isEmpty() ? (d.html(UIERRORS.MOBILE_REQUIRED), (b = !1)) : validateNumeric(e) ? (validatePhoneLength(e) ? d.html(UIERRORS.EMPTY) : (d.html(UIERRORS.MOBILE_MINIMUM), (b = !1))) : (d.html(UIERRORS.MOBILE_NUMBER), (b = !1));
    }
    if ("email" == a || "All" == a)
        (c = $("#voEmail")), (e = c.val()), (d = $("#voMemberEmailError")), c.isEmpty() ? (d.html(UIERRORS.EMAIL_REQUIRED), (b = !1)) : validateEmail(e) ? d.html(UIERRORS.EMPTY) : (d.html(UIERRORS.EMAIL_INVALID), (b = !1));
    if ("country" == a || "All" == a) (c = $("#voCountry")), (d = $("#voMemberCountryError")), c.isEmpty() ? (d.html(UIERRORS.COUNTRY_REQUIRED), (b = !1)) : d.html(UIERRORS.EMPTY);
    if ("state" == a || "All" == a)
        (c = $("#voState")), (e = $("#voCountry").val()), (d = $("#voMemberStateError")), "India" == e ? (c.isEmpty() ? (d.html(UIERRORS.STATE_REQUIRED), (b = !1)) : d.html(UIERRORS.EMPTY)) : d.html(UIERRORS.EMPTY);
    if ("city" == a || "All" == a) (c = $("#voCity")), (e = $("#voCountry").val()), (d = $("#voMemberCityError")), "India" == e ? (c.isEmpty() ? (d.html(UIERRORS.CITY_REQUIRED), (b = !1)) : d.html(UIERRORS.EMPTY)) : d.html(UIERRORS.EMPTY);
    if ("address" == a || "All" == a) (c = $("#voAddress")), (d = $("#voMemberAddressError")), c.isEmpty() ? (d.html(UIERRORS.ADDRESS_LINE1_REQUIRED), (b = !1)) : d.html(UIERRORS.EMPTY);
    if ("pin" == a || "All" == a)
        (c = $("#voPin")), (e = c.val()), (d = $("#voMemberPinError")), c.isEmpty() ? (d.html(UIERRORS.PINCODE_REQUIRED), (b = !1)) : validateNumeric(e) ? d.html(UIERRORS.EMPTY) : (d.html(UIERRORS.PINCODE_NUMBERS), (b = !1));
    return b;
}
function setActiveClass(a) {
    $(a).addClass("fl-active");
}
function knowMoreTACCheckBok(a, b) {
    $("#" + a).is(":checked") ? $("#" + b).enableButton() : $("#" + b).disableButton();
}
function saveMemberInfo() {
    if (
        validateMemberShipform("fname") &&
        validateMemberShipform("lname") &&
        validateMemberShipform("age") &&
        validateMemberShipform("mobile") &&
        validateMemberShipform("email") &&
        validateMemberShipform("country") &&
        validateMemberShipform("state") &&
        validateMemberShipform("city") &&
        validateMemberShipform("address") &&
        validateMemberShipform("pin")
    ) {
        $("#voSubmit").attr("disabled", "disabled");
        var a = $("#vofName").val(),
            b = $("#volName").val(),
            c = $("#voMobile").val(),
            d = $("#voEmail").val(),
            e = $("#voCountry").val(),
            f = $("#voState").val(),
            k = $("#voCity").val(),
            h = $("#voAddress").val(),
            g = $("#voPin").val(),
            t = $("#voAge").val(),
            u = $("#voEducation").val(),
            l = $("#voCreditcard").val(),
            v = $("#voChildren").val(),
            w = $("#voMonthlyincome").val(),
            x = $("#voCarOwned").val(),
            m,
            n,
            p,
            q,
            r;
        $("#Single").is(":checked") && (m = "Single");
        $("#Married").is(":checked") && (m = "Married");
        $("#houseyes").is(":checked") && (n = !0);
        $("#houseno").is(":checked") && (n = !1);
        $("#gymyes").is(":checked") && (p = !0);
        $("#gymno").is(":checked") && (p = !1);
        $("#clubyes").is(":checked") && (q = !0);
        $("#clubno").is(":checked") && (q = !1);
        $("#dslryes").is(":checked") && (r = !0);
        $("#dslrno").is(":checked") && (r = !1);
        "India" != e && (k = f = "");
        http_post(
            GlobalConstants.URL.VO.PURCHASE_CREATE_LEAD_URL,
            function (l) {
                l && l.responseJSON && 200 == l.responseJSON.statusCode
                    ? ((VOLandingMember.VOLeadId = l.responseJSON.data.id),
                      (VOLandingMember.phoneNumber = c),
                      (VOLandingMember.voMemberEmail = d),
                      (VOLandingMember.voMemberFirstName = a),
                      (VOLandingMember.voMemberLastName = b),
                      (VOLandingMember.voMemberCity = k),
                      (VOLandingMember.voMemberPin = g),
                      (VOLandingMember.voMemberCountry = e),
                      (VOLandingMember.voMemberState = f),
                      (VOLandingMember.voMemberAddress = h),
                      $("#purchase-plan").modal("show"),
                      $(".purchase-otp").addClass("hidden"),
                      $(".purchase-thank").removeClass("hidden"),
                      $(".purchase-yes").show(),
                      $(".purchase-wait").removeClass("hidden"),
                      $("#voSubmit").removeAttr("disabled"),
                      clearBecomeMemberShipForm(),
                      clearBecomeMemberShipFormErrors())
                    : ($("#voSubmit").removeAttr("disabled"), display({ type: "ERROR", header: "Error", message: API_ERROR[l.responseJSON.apiError] }));
            },
            {
                firstName: a,
                lastName: b,
                mobilePhone: c,
                email: d,
                country: e,
                billingState: f,
                city: k,
                addressLine1: h,
                postalCode: g,
                ageGroup: t,
                educations: u,
                creditCardType: l,
                noOfChildren: v,
                monthlyHouseholdIncome: w,
                carOwned: x,
                maritalStatus: m,
                home: n,
                gymMembership: p,
                clubMembership: q,
                dSLRCamera: r,
            }
        );
    }
}
function clearBecomeMemberShipForm() {
    $("#vofName").val("");
    $("#volName").val("");
    $("#voMobile").val("");
    $("#voEmail").val("");
    $("#voCountry").val("");
    $("#voState").val("");
    $("#voCity").val("");
    $("#voAddress").val("");
    $("#voPin").val("");
    $("#voAge").val("");
    $("#voEducation").val("");
    $("#voCreditcard").val("");
    $("#voChildren").val("");
    $("#voMonthlyincome").val("");
    $("#voCarOwned").val("");
    $("#Single").removeAttr("checked");
    $("#Married").removeAttr("checked");
    $("#houseyes").removeAttr("checked");
    $("#houseno").removeAttr("checked");
    $("#gymyes").removeAttr("checked");
    $("#gymno").removeAttr("checked");
    $("#clubyes").removeAttr("checked");
    $("#clubno").removeAttr("checked");
    $("#dslryes").removeAttr("checked");
    $("#dslrno").removeAttr("checked");
    $(".agegroup").val("default");
    $(".agegroup").selectpicker("refresh");
    $(".education-class").val("default");
    $(".education-class").selectpicker("refresh");
    $(".children-class").val("default");
    $(".children-class").selectpicker("refresh");
    $(".monthlyIncome-class").val("default");
    $(".monthlyIncome-class").selectpicker("refresh");
    $(".creditCard-class").val("default");
    $(".creditCard-class").selectpicker("refresh");
    $(".carOwned-class").val("default");
    $(".carOwned-class").selectpicker("refresh");
    $(".countries-vo").val("default");
    $(".countries-vo").selectpicker("refresh");
    $(".states-vo").val("default");
    $(".states-vo").selectpicker("refresh");
    $(".cities-vo").val("default");
    $(".cities-vo").selectpicker("refresh");
    $("#countryLabel").removeClass("fl-active");
    $("#stateLabel").removeClass("fl-active");
    $("#cityLabel").removeClass("fl-active");
}
function clearBecomeMemberShipFormErrors() {
    $("#voMemberFirstNameError").html(UIERRORS.EMPTY);
    $("#voMemberLastNameError").html(UIERRORS.EMPTY);
    $("#voMemberPhoneNumberError").html(UIERRORS.EMPTY);
    $("#voMemberEmailError").html(UIERRORS.EMPTY);
    $("#voMemberCountryError").html(UIERRORS.EMPTY);
    $("#voMemberStateError").html(UIERRORS.EMPTY);
    $("#voMemberCityError").html(UIERRORS.EMPTY);
    $("#voMemberAddressError").html(UIERRORS.EMPTY);
    $("#voMemberPinError").html(UIERRORS.EMPTY);
}
var getStates;
getCountries = function (a, b) {
    var c = jQuery("#" + a).attr("class");
    if (c) {
        var d = c.split(" "),
            e = c.split(" ");
        e.shift();
        0 < e.length && ((acC = e.join()), encodeURIComponent(acC));
        var f = !1;
        jQuery.each(e, function (a, b) {
            b.match("^presel-") && (f = b.substring(7));
            b.match("^presel-byi");
        });
    }
    getData("/bin/nodeutil.content__sterlingholidays__en__index__main-authoring-dialog__jcr-content__par__author_dialog.property__addEvent.property__countryList.json", function (c) {
        if (200 == c.status) {
            c = c.responseJSON;
            var h = {};
            h = c.countryList;
            jQuery("#" + a + " option:gt(0)").remove();
            jQuery("#" + a)
                .find("option:eq(0)")
                .attr("value", "");
            var g = {};
            $.each(h, function (a, b) {
                b = JSON.parse(b);
                g[b.countryCode] = b.countryName;
            });
            h.result = g;
            if (-1 < jQuery.inArray("group-continents", e)) {
                var k = jQuery("." + d[0]);
                jQuery.each(h.result, function (a, b) {
                    var c = jQuery("\x3coptgroup\x3e", { label: a });
                    0 < b.length && c.appendTo(k);
                    jQuery.each(b, function (a, b) {
                        a = jQuery("\x3coption /\x3e");
                        a.attr("value", b.name).text(b.name);
                        a.attr("countryid", b.id);
                        f && f.toUpperCase() == b.id && a.attr("selected", "selected");
                        a.appendTo(c);
                    });
                });
            } else
                jQuery.each(h.result, function (c, d) {
                    var e = jQuery("\x3coption /\x3e");
                    e.attr("value", d).text(d);
                    e.attr("countryid", c);
                    f && f.toUpperCase() == c && e.attr("selected", "selected");
                    d == b && e.attr("selected", "selected");
                    jQuery("#" + a).append(e);
                });
            f && jQuery("." + d[0]).trigger("change");
            jQuery("#" + a).prop("disabled", !1);
            $(".selectpicker").selectpicker("refresh");
        }
    });
    return "";
};
setStates = function (a, b, c) {
    var d = jQuery("#" + a).attr("class");
    d.split(" ");
    jQuery("#" + a + " option:gt(0)").remove();
    jQuery("." + b + " option:gt(0)").remove();
    b = d.split(" ");
    b.shift();
    0 < b.length && ((acC = b.join()), encodeURIComponent(acC));
    b = domainBaseUrl + "/common/statesByCountry?country\x3dIndia";
    jQuery("#" + a)
        .find("option:eq(0)")
        .html("Please wait..");
    postData(b, function (b) {
        c
            ? jQuery("#" + a)
                  .find("option:eq(0)")
                  .html(c)
            : jQuery("#" + a)
                  .find("option:eq(0)")
                  .html("Select State");
        jQuery("#" + a)
            .find("option:gt(0)")
            .remove();
        var d = [];
        b.data.length && ((b.result = removeDuplicate(b.data)), (b.result = converStatesObj(b.result, "state")), (getStates = b.result));
        for (var e in b.result) b.result.hasOwnProperty(e) && d.push({ key: e, value: b.result[e] });
        b = d.sort(function (a, b) {
            return a.value.localeCompare(b.value);
        });
        jQuery.each(b, function (b, c) {
            b = jQuery("\x3coption /\x3e");
            b.attr("value", c.value).text(c.value);
            b.attr(a, c.key);
            jQuery("#" + a).append(b);
        });
        jQuery("#" + a).prop("disabled", !1);
        $(".selectpicker").selectpicker("refresh");
    });
    return "";
};
setCities = function (a, b, c, d) {
    var e = jQuery("#" + b).attr("class");
    e.split(" ");
    jQuery("#" + b + " option:gt(0)").remove();
    e = e.split(" ");
    e.shift();
    0 < e.length && ((acC = e.join()), encodeURIComponent(acC));
    c = escape(c);
    c = domainBaseUrl + "/common/citiesByState?country\x3dIndia\x26state\x3d" + c;
    jQuery("#" + b)
        .find("option:eq(0)")
        .html("Please wait..");
    postData(c, function (c) {
        d
            ? jQuery("#" + b)
                  .find("option:eq(0)")
                  .html(d)
            : jQuery("#" + b)
                  .find("option:eq(0)")
                  .html("Select City");
        jQuery("#" + b)
            .find("option:gt(0)")
            .remove();
        c.result = c.data;
        c.result = converStatesObj(c.result, "name");
        var e = Object.keys(c.result).length,
            f = [],
            g;
        for (g in c.result) c.result.hasOwnProperty(g) && f.push({ key: g, value: c.result[g] });
        c = f.sort(function (a, b) {
            return a.value.localeCompare(b.value);
        });
        if (0 < e && ((a && jQuery("#" + a + " option:selected").val()) || !a))
            jQuery.each(c, function (a, c) {
                a = jQuery("\x3coption /\x3e");
                a.attr("value", c.value).text(c.value);
                jQuery("#" + b).append(a);
            });
        else if ((e = jQuery("#" + a + " option:selected").val())) (c = jQuery("\x3coption /\x3e")), c.attr("value", e).text(e), jQuery("#" + b).append(c);
        jQuery("#" + b).prop("disabled", !1);
        $(".selectpicker").selectpicker("refresh");
    });
    return "";
};
function removeDuplicate(a) {
    var b = [];
    $.each(a, function (a, d) {
        var c = !1;
        $.each(b, function (a, b) {
            d.state == b.state && (c = !0);
        });
        0 == c && "" != d.state && b.push(d);
    });
    return b;
}
function converStatesObj(a, b) {
    var c = [];
    $.each(a, function (a, e) {
        c[a] = e[b];
    });
    return c;
}
$(document).ready(function () {
    $(document).on("click", "#loginBtn", function () {
        $("#loginBtn").disableButton();
        setSessionData("socialLogin", !1);
        var a = $("#memberID").val(),
            b = $("#memberPassword").val();
        $("#invalidMemberPasswordError").html(UIERRORS.EMPTY);
        $("#memberLoginError").html(UIERRORS.EMPTY);
        loginAsVOMember(a, b, callBackFunMemberLogin);
    });
    $("#memberMobile").keyup(function (a) {
        "13" == (a.keyCode ? a.keyCode : a.which) && menberLoginOTP("form1");
    });
    $("#memberEmail").keyup(function (a) {
        "13" == (a.keyCode ? a.keyCode : a.which) && menberLoginOTP("form1");
    });
    $("#memberOTP").keyup(function (a) {
        "13" == (a.keyCode ? a.keyCode : a.which) && submitMemberOTP();
    });
    $(document).on("click", "#signInAsMember", function () {
        $("#signInAsMember").disableButton();
        $("#member_form_username").val();
        $("#member_form_password").val();
        $("#invalidMemberPasswordError").html(UIERRORS.EMPTY);
        $("#memberLoginError").html(UIERRORS.EMPTY);
        menberLoginOTP("form1");
    });
    $(document).on("click", "#memberFormResendOTP", function () {
        menberLoginOTP("form2");
    });
    $(document).on("click", "#submitMemberOTP", function () {
        deleteSession("isQuickPayLogin");
        submitMemberOTP();
    });
    $(document).on("click", "#submitMemberOTP2", function () {
        setSessionData("isQuickPayLogin", !0);
        submitMemberOTP();
    });
    $(document).on("click", "#openResetVoPwdModal", function () {
        $("#modal-authentication").modal("hide");
        $("#modal-forgot-pwd-email").modal("show");
        $("#currentUserTypeResetPwd").html("vo");
    });
    $("#member_form_username").blur(function () {
        validateMemberLoginForm("validateAll");
    });
    $("#member_form_password").keyup(function () {
        validateMemberLoginForm("validateAll");
    });
    $("#memberMobile").blur(function () {
        validateMemberLoginForm("mobile");
    });
    $("#memberMobile").keyup(function () {
        validateMemberLoginForm("mobile");
    });
    $("#memberEmail").blur(function () {
        validateMemberLoginForm("mail");
    });
    $("#memberEmail").keyup(function () {
        validateMemberLoginForm("mail");
    });
    $("#memberOTP").blur(function () {
        validateMemberLoginForm("memberOTP");
    });
    $("#memberOTP").keyup(function () {
        validateMemberLoginForm("memberOTP");
    });
    $("#quickPayCheckBox").change(function () {
        this.checked ? $("#quickPaySection").show() : $("#quickPaySection").hide();
    });
});
function memberLoginSuccess(a) {
    setSessionData("timestamp", $.datepicker.formatDate("yy-mm-dd", new Date()));
    setSessionData("isLoggedIn", !0);
    var b = session_get();
    b.timestamp = new Date().getTime();
    b.isLoggedIn = !0;
    b.user = a;
    b.user.userType = a.type;
    b.user.primaryid = a.contracts[0].contractId;
    b.user.current = a.contracts[0].sterlingContractId;
    b.user.webStatus = a.webStatus;
    var c = a.contracts[0].lastName ? a.contracts[0].lastName : "";
    setItem("voUserFirstName", a.contracts[0].firstName ? a.contracts[0].firstName : "");
    setItem("voUserLastName", c);
    setSessionData("userType", "vo");
    session_set(b);
    "CUSTOMER" == a.type && (a.showPTSTC ? showPTSTCPopup() : updateVODashboard(b.user.primaryid, b.user.current, dashBoardSuccessCall));
}
function dashBoardSuccessCall(a) {
    "failed" == a.status
        ? display({ type: "ERROR", header: "Error", message: API_ERROR[a.apiError] })
        : (getAdminList(), getSessionData("isQuickPayLogin") ? (deleteSession("isQuickPayLogin"), (window.location = getQuickpayLoginPath())) : (window.location = PAGE.voDashboard));
}
function getQuickpayLoginPath() {
    var a = session_get();
    return a &&
        a.user &&
        a.user.contracts &&
        a.user.contracts[0] &&
        a.user.contracts[0].account &&
        a.user.contracts[0].account.membershipDetails &&
        a.user.contracts[0].account.membershipDetails.productType &&
        "pts" != a.user.contracts[0].account.membershipDetails.productType &&
        "PTS" != a.user.contracts[0].account.membershipDetails.productType
        ? PAGE.voDashboard + "#qpay_login"
        : PAGE.voDashboard;
}
function validateMemberLoginForm(a) {
    if ("validateAll" == a || "email" == a)
        $("#member_form_username").isEmpty()
            ? $("#memberFormEmailError").html(UIERRORS.EMAIL_REQUIRED)
            : validateEmail($("#member_form_username").val())
            ? $("#memberFormEmailError").html(UIERRORS.EMPTY)
            : $("#memberFormEmailError").html(UIERRORS.EMAIL_INVALID);
    if ("validateAll" == a || "pwd" == a)
        $("#member_form_password").isEmpty()
            ? $("#memberFormPasswordError").html(UIERRORS.PASSWORD_REQUIRED)
            : "string" === typeof passwordValidation($("#member_form_password").val())
            ? $("#memberFormPasswordError").html(passwordValidation($("#member_form_password").val()))
            : $("#memberFormPasswordError").html(UIERRORS.EMPTY),
            0 < $("#member_form_password").val().length ? $("#signInAsMember").enableButton() : $("#signInAsMember").disableButton();
    "mobile" == a &&
        ($("#memberMobile").isEmpty()
            ? ($("#memberFormMobileError").html("Please enter your registered mobile number"), $("#signInAsMember").disableButton())
            : validateNumeric($("#memberMobile").val())
            ? validatePhoneLength($("#memberMobile").val())
                ? ($("#memberFormMobileError").html(UIERRORS.EMPTY), $("#signInAsMember").enableButton())
                : ($("#memberFormMobileError").html(UIERRORS.MOBILE_MINIMUM), $("#signInAsMember").disableButton())
            : ($("#memberFormMobileError").html(UIERRORS.MOBILE_NUMBER), $("#signInAsMember").disableButton()));
    "mail" == a &&
        ($("#memberEmail").isEmpty()
            ? $("#memberFormMailError").html(UIERRORS.EMAIL_REQUIRED)
            : validateEmail($("#memberEmail").val())
            ? ($("#memberFormMailError").html(UIERRORS.EMPTY), $("#signInAsMember").enableButton())
            : $("#memberFormMailError").html(UIERRORS.EMAIL_INVALID));
    "memberOTP" == a &&
        ($("#memberOTP").isEmpty()
            ? ($("#memberFormOTPError").html(UIERRORS.OTP_REQUIRED), $("#submitMemberOTP").disableButton(), $("#submitMemberOTP2").disableButton())
            : minLengthValidation($("#memberOTP").val(), 6)
            ? ($("#memberFormOTPError").html(UIERRORS.EMPTY), $("#submitMemberOTP").enableButton(), $("#submitMemberOTP2").enableButton())
            : ($("#memberFormOTPError").html(UIERRORS.OTP_INVALID), $("#submitMemberOTP").disableButton(), $("#submitMemberOTP2").disableButton()));
}
function callBackFunMemberLogin(a) {
    "OK" == a.statusText || "success" == a.statusText
        ? ($("#invalidMemberPasswordError").html(UIERRORS.EMPTY), $("#memberLoginError").html(UIERRORS.EMPTY), a.responseJSON && a.responseJSON.data && memberLoginSuccess(a.responseJSON.data))
        : 401 == a.status && a.responseJSON && "PARALLEL_LOGIN" == a.responseJSON.errors && "6155" == a.responseJSON.apiError
        ? (setSessionData("userType", null), $("#modal-authentication").modal("hide"), $("#loginBtn").enableButton(), $("#signInAsMember").enableButton(), $("#parallelLoginPopup").modal("show"))
        : (setSessionData("userType", null),
          $("#invalidMemberPasswordError").html(API_ERROR[a.responseJSON.apiError]),
          $("#memberLoginError").html(API_ERROR[a.responseJSON.apiError]),
          $("#loginBtn").enableButton(),
          $("#signInAsMember").enableButton());
}
function callbackVOResetPasswordByemail(a) {
    a && a.data ? ((a = a.data.uniqueId), $("#modal-authentication").modal("hide"), $("#modal-reset-password").modal("show"), $(".setEmail").val(a)) : $("#memberLoginError").html(API_ERROR[a.apiError]);
}
function resetVOPwd(a, b) {
    resetPasswordUsingEmail(a, b, "vo", callbackVOResetPasswordByemail);
}
function menberLoginOTP(a) {
    $("#signInAsMember").disableButton();
    $("#memberLoginError").html(UIERRORS.EMPTY);
    var b = $("#memberMobile").val(),
        c = $(".member-login-via:checked").val();
    c && "email" == c ? ((b = $("#memberEmail").val()), (c = "EMAIL")) : (c = "MOBILE");
    "form2" == a && ($("#memberOTP").val(UIERRORS.EMPTY), $("#memberOTP").focus(), $("#submitMemberOTP").disableButton(), $("#submitMemberOTP2").disableButton(), $("#isMemberOTPResent").show());
    getMenberLoginOTP(c, b, callbackMemberLoginOTP);
}
function callbackMemberLoginOTP(a) {
    a && a.data
        ? ((a = a.data.uniqueId) && emailValidation(a) ? $(".memberMobileNum").html(getMaskedMail(a) + " and your registered Mobile number") : $(".memberMobileNum").html(getMaskedMobile(a) + " and your registered Email ID"),
          $("#memberLoginForm1").slideUp(),
          $("#memberLoginForm2").slideDown())
        : ($("#memberLoginError").html("Please enter the Mobile number/Email ID registered against your membership id to login"), $("#memberMobile").focus(), $("#signInAsMember").enableButton());
}
function submitMemberOTP() {
    $("#submitMemberOTP").disableButton();
    $("#submitMemberOTP2").disableButton();
    var a = $("#memberMobile").val(),
        b = $("#memberOTP").val(),
        c = $(".member-login-via:checked").val();
    c && "email" == c ? ((a = $("#memberEmail").val()), (c = "EMAIL")) : (c = "MOBILE");
    verifyMenberLoginOTP(c, a, b, callbackVerifyMemberLoginOTP);
}
function callbackVerifyMemberLoginOTP(a) {
    if (a && a.data) {
        a = $("#memberMobile").val();
        var b = $(".member-login-via:checked").val();
        b && "email" == b ? ((a = $("#memberEmail").val()), (b = "MAIL")) : (b = "MOB");
        loginAsVOMemberWithMobile(a, b, callBackFunMemberLogin);
    } else $("#memberFormOTPError").html(API_ERROR[a.apiError]);
}
function loginAsVOMember(a, b, c) {
    login(GlobalConstants.DOMAIN_URL + GlobalConstants.URL.LOGIN, "VO|" + a + ":" + b, function (a) {
        if ("OK" == a.statusText || "success" == a.statusText) {
            clear();
            var b = a.getResponseHeader("X-AUTH-TOKEN"),
                d = session_get();
            d.authHeader = b;
            session_set(d);
        }
        c(a);
    });
}
function loginAsVOMemberWithMobile(a, b, c) {
    login(GlobalConstants.DOMAIN_URL + GlobalConstants.URL.LOGIN, "VO|" + a + "|" + b, function (a) {
        if ("OK" == a.statusText || "success" == a.statusText) {
            clear();
            var b = a.getResponseHeader("X-AUTH-TOKEN"),
                d = session_get();
            d.authHeader = b;
            session_set(d);
        }
        c(a);
    });
}
function getMenberLoginOTP(a, b, c) {
    http_post(
        GlobalConstants.URL.VO.VO_USER_OTP,
        function (a) {
            c(a.responseJSON);
        },
        { contactType: a, value: b, mobileNo: b, otpFor: "VO_MEMBER_LOGIN_OTP" }
    );
}
function verifyMenberLoginOTP(a, b, c, d) {
    http_post(
        GlobalConstants.URL.VO.VERIFY_MEMBER_OTP,
        function (a) {
            d(a.responseJSON);
        },
        { contactType: a, value: c, mobileNo: b }
    );
}
function updateVODashboard(a, b, c) {
    a = { primaryId: a, contractId: b };
    var d = session_get().authHeader;
    http_post(
        GlobalConstants.DOMAIN_URL + GlobalConstants.URL.VO.GET_DASHBOARD_ACCOUNT_DETAILS,
        function (a) {
            if ("failed" == a.responseJSON.status) c(a.responseJSON);
            else {
                var d = session_get();
                if (d && d.user.contracts) {
                    for (var e = 0; e < d.user.contracts.length; e++) d.user.contracts[e].sterlingContractId == b && (d.user.contracts[e].account = a.responseJSON.data);
                    session_set(d);
                    c(a.responseJSON);
                }
            }
        },
        a,
        d
    );
}
$(document).ready(function () {
    getAdminList();
    $(document).on("click", "#ptsAccept", function () {
        acceptOrDeclineTC("Accept");
    });
    $(document).on("click", "#ptsDecline", function () {
        acceptOrDeclineTC("Decline");
    });
});
function showPTSTCPopup() {
    getSessionData("AdminContentData") || getAdminList();
    getAdminDataFromSession();
}
function getAdminDataFromSession() {
    if (getSessionData("AdminContentData")) {
        var a = getSessionData("AdminContentData").content;
        a = JSON.parse(a);
        a.ptsTerms &&
            ((document.getElementById("ptsTermsList").innerHTML = ""),
            (document.getElementById("ptsTermsList").innerHTML += a.ptsTerms),
            $("#ptsAccept").enableButton(),
            $("#ptsDecline").enableButton(),
            $("#modal-authentication").modal("hide"),
            $("#modal-ptsTermsCond").modal({ backdrop: "static" }));
    } else display({ type: "ERROR", header: "Error", message: "ServerError" }), ptsSignOut();
}
function acceptOrDeclineTC(a) {
    $("#ptsAccept").disableButton();
    $("#ptsDecline").disableButton();
    var b = session_get();
    http_post(
        GlobalConstants.DOMAIN_URL + GlobalConstants.URL.VO.PTS_TC_STATUS,
        function (c) {
            200 == c.status && c.responseJSON && "success" == c.responseJSON.status ? ("Accept" == a ? updateVODashboard(b.user.primaryid, b.user.current, dashBoardSuccessCall) : ptsSignOut()) : ptsSignOut();
        },
        { contractId: b.user.contracts[0].contractId, contactEmail: b.user.contracts[0].contactEmail, actionType: a },
        b.authHeader
    );
}
function ptsSignOut() {
    $("#modal-ptsTermsCond").modal("hide");
    signout();
}
function getOTPForHSDIndividual(a, b) {
    hsdCommonPostCall(GlobalConstants.DOMAIN_URL + GlobalConstants.URL.HSD.HSD_REGISTER_INDIVIDUAL_GET_OTP, a, b);
}
function registerHSDIndividual(a, b) {
    hsdCommonPostCall(GlobalConstants.DOMAIN_URL + GlobalConstants.URL.HSD.HSD_REGISTER_INDIVIDUAL, a, b);
}
function hsdCommonPostCall(a, b, c) {
    $.ajax({
        type: "POST",
        url: a,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(b),
        cache: !0,
        complete: function (b, e) {
            localCache.set(a, b, c);
        },
    });
}
function loginAsGuest(a, b, c) {
    login(GlobalConstants.DOMAIN_URL + GlobalConstants.URL.LOGIN, "HSD|" + a + ":" + b, function (a) {
        if ("OK" == a.statusText || "success" == a.statusText) {
            clear();
            var b = a.getResponseHeader("X-AUTH-TOKEN"),
                d = session_get();
            d.authHeader = b;
            session_set(d);
        }
        c(a);
    });
}
function getCustomerPersonalDetails(a, b) {
    http_post(
        GlobalConstants.DOMAIN_URL + GlobalConstants.URL.HSD.GET_CUSTOMER_DETAILS,
        function (a) {
            if (a && a.responseJSON && a.responseJSON.data) {
                var c = session_get();
                c.user.profile = a.responseJSON.data;
                session_set(c);
                b(a.responseJSON.data);
            }
        },
        { email: a }
    );
}
function updateDashboardHsdPost(a, b) {
    http_post(
        GlobalConstants.DOMAIN_URL + GlobalConstants.URL.HSD.GET_DASHBOARD_ACCOUNT_DETAILS,
        function (a) {
            if (a && a.responseJSON && a.responseJSON.data) {
                var c = session_get();
                c && c.user && ((c.user.account = a.responseJSON.data), session_set(c));
                b(a.responseJSON.data);
            }
        },
        { memberId: a }
    );
}
$(document).ready(function () {
    $(document).on("click", "#signInAsGuest", function () {
        if (validateGuestLogin("validateAll")) {
            $("#signInAsGuest").disableButton();
            var a = $("#guest_form_username").val(),
                b = $("#guest_form_password").val();
            loginAsGuest(a, b, function (a) {
                "OK" == a.statusText || "success" == a.statusText
                    ? ($("#signInAsGuest").enableButton(), a.responseJSON && a.responseJSON.data && guestLoginSuccess(a.responseJSON.data))
                    : (setSessionData("userType", null), $("#loginInvalidGuestMsg").html(API_ERROR[a.responseJSON.apiError]));
            });
        }
    });
    $(document).on("click", "#openResetHsdPwdModal", function () {
        $("#modal-authentication").modal("hide");
        $("#modal-forgot-pwd-email").modal("show");
        $("#currentUserTypeResetPwd").html("hsd");
    });
    $("#guest_form_username").blur(function () {
        validateGuestLogin("email");
    });
    $("#guest_form_password").keyup(function () {
        validateGuestLogin("pwd");
    });
});
function validateGuestLogin(a) {
    var b = !0;
    if ("validateAll" == a || "email" == a)
        $("#guest_form_username").isEmpty()
            ? ($("#errorMsg_guest_email").html(UIERRORS.EMAIL_REQUIRED), (b = !1))
            : validateEmail($("#guest_form_username").val())
            ? $("#errorMsg_guest_email").html(UIERRORS.EMPTY)
            : ($("#errorMsg_guest_email").html(UIERRORS.EMAIL_INVALID), (b = !1));
    if ("validateAll" == a || "pwd" == a)
        $("#guest_form_password").isEmpty()
            ? ($("#errorMsg_guest_password").html(UIERRORS.PASSWORD_REQUIRED), (b = !1))
            : "string" === typeof passwordValidation($("#guest_form_password").val())
            ? ($("#errorMsg_guest_password").html(passwordValidation($("#guest_form_password").val())), (b = !1))
            : $("#errorMsg_guest_password").html(UIERRORS.EMPTY),
            0 < $("#guest_form_password").val().length ? $("#signInAsGuest").enableButton() : $("#signInAsGuest").disableButton();
    return b;
}
function guestLoginSuccess(a) {
    $("#modal-authentication").modal("hide");
    $("#modal-social-data-registration").modal("hide");
    $("#signUpHsd").modal("hide");
    setSessionData("timestamp", $.datepicker.formatDate("yy-mm-dd", new Date()));
    setSessionData("isLoggedIn", !0);
    var b = session_get();
    b.timestamp = new Date().getTime();
    b.isLoggedIn = !0;
    b.user = a;
    b.user.userType = a.attributes.type;
    b.user.primaryid = a.id;
    b.user.current = a.id;
    setSessionData("HSDbookingTimer", $("#clock").html());
    session_set(b);
    setSessionData("userType", "hsd");
    getCustomerPersonalDetails(a.email, guestDetailsSuccessCallBack);
}
function guestDetailsSuccessCallBack(a) {
    a = session_get();
    updateDashboardHsd(a.user.primaryid);
}
function updateDashboardHsd(a) {
    updateDashboardHsdPost(a, function (a) {
        window.location = PAGE.hsdDashboard;
    });
}
$(function () {
    $(window).resize();
});
$("#menu").dmenu({
    menu: { border: !1, logo: !1, align: !1 },
    item: {
        bg: !1,
        border: !0,
        subindicator: !1,
        fit: [
            { items: null, fitter: "icon-hide", order: "all" },
            { items: null, fitter: "icon-only", order: "all" },
            { items: ":not(.dm-item_align-right)", fitter: "submenu", order: "rtl" },
            { items: ":not(.dm-item_align-right)", fitter: "hide", order: "rtl" },
        ],
    },
    submenu: { arrow: !0, border: !1, shadow: !0 },
    subitem: { bg: !0, border: !1 },
});
$(function () {
    $(".js_megamenu_resort_details_main_anchor").on("mouseover", function () {
        $(".js_megamenu_resort_details_img_div").hide();
    });
    $(".js_megamenu_resort_details_main_div .js_megamenu_resort_details_show_img").on("mouseover", function () {
        var a = !0,
            b = $(this).data("resortimglocaion");
        b
            ? ((a = '\x3cdiv style\x3d"width:250px;heigth:150px;" class\x3d"text-center"\x3e\x3cimg class\x3d"" src\x3d"' + b + '" alt\x3d"Resort" style\x3d"width:200px;max-height:150px;"\x3e\x3c/div\x3e'),
              $(this).closest(".js_megamenu_resort_details_main_div").find(".js_megamenu_resort_details_img").html(a),
              (a = !1))
            : $(this).closest(".js_megamenu_resort_details_main_div").find(".js_megamenu_resort_details_img").html("");
        (b = $(this).data("resortheader"))
            ? ((a = '\x3cspan class\x3d"dm-menu_word_wrap_txt"\x3e' + b + "\x3c/span\x3e"), $(this).closest(".js_megamenu_resort_details_main_div").find(".js_megamenu_resort_details_header").html(a), (a = !1))
            : $(this).closest(".js_megamenu_resort_details_main_div").find(".js_megamenu_resort_details_header").html("");
        var c = $(this).data("resortdesc");
        b
            ? ((a = '\x3cspan class\x3d"dm-menu_word_wrap_txt" style\x3d"font-size:91%"\x3e' + c + "\x3c/span\x3e"), $(this).closest(".js_megamenu_resort_details_main_div").find(".js_megamenu_resort_details_desc").html(a), (a = !1))
            : $(this).closest(".js_megamenu_resort_details_main_div").find(".js_megamenu_resort_details_desc").html("");
        $(this).data("resortlink");
        $(this).data("resortlinktxt");
        a ? $(this).closest(".js_megamenu_resort_details_main_div").find(".js_megamenu_resort_details_img_div").hide() : $(this).closest(".js_megamenu_resort_details_main_div").find(".js_megamenu_resort_details_img_div").show();
    });
});
$(document).on("click", ".close", function (a) {
    stopVideo();
});
$(document).ready(function () {
    $("#bookingWidget").on("show.bs.modal", function () {
        $("#roomsdetail").modal("hide");
    });
    window.matchMedia("only screen and (max-width: 760px)").matches &&
        $(".ytImg").each(function () {
            var a = $(this).attr("link-src");
            $(this).replaceWith(
                "\x3ciframe src\x3d'" + a + "' style\x3d'position:absolute;width:100%;height:100%;left:0' width\x3d'100%' height\x3d'100%' frameborder\x3d'0' allow\x3d'autoplay; encrypted-media' allowfullscreen\x3e\x3c/iframe\x3e"
            );
        });
});
$("body").click(function () {
    $(".modal").is(":visible") && stopVideo();
});
$(document).keydown(function (a) {
    27 == a.keyCode && $(".modal").is(":visible") && stopVideo();
});
function stopVideo() {
    $(".ytvideo").each(function () {
        $(this).attr("src");
        $(this).attr("src", "");
    });
}
$(".hide-in-mobile").click(function (a) {
    var b = $(this).data("target").replace("#", "");
    $(".yt").each(function () {
        if (b === $(this).attr("refId")) {
            var a = $(this).attr("link-src") + "\x26autoplay\x3d1";
            $(this).attr("src", a);
        }
    });
});
var offerAtTheDestArr = [],
    destOfferResortArr = [];
(cur_session = session_get()) && cur_session.isLoggedIn && cur_session.user && "CUSTOMER" == cur_session.user.userType && $("#hsd-dest-offer").remove();
$(document).ready(function () {
    getOfferAtTheDestData();
    $(".destination-resort-names").each(function () {
        var a = $(this).text();
        destOfferResortArr.push(a);
    });
});
function getOfferAtTheDestData() {
    getData(GlobalConstants.URL.HSD.GET_VALID_PROMOS, setOfferAtTheDestData);
}
function goToAppliedOfferBooking(a) {
    var b = {};
    if (a && 0 < offerAtTheDestArr.length) for (var c = 0; c < offerAtTheDestArr.length; c++) offerAtTheDestArr[c].promoCode == a && (b = offerAtTheDestArr[c]);
    b && (setSessionData("destinationPromo", b), (offerAtTheDestArr = []), (window.location = PAGE.hsdSearchPage));
}
function setOfferAtTheDestData(a) {
    a = a.responseJSON;
    var b = function (a) {
        var b = a.imageThumbnail;
        return (
            '\x3cdiv class\x3d"col-md-4 col-sm-6 mb-30"\x3e\n        \x3cdiv class\x3d"white-card pos-relative"\x3e\n             \x3cdiv class\x3d"over-img"\x3e\n                 \x3cpicture\x3e\n                     \x3csource media\x3d"(max-width: 420px)" data-srcset\x3d"' +
            b +
            '"\x3e\n                     \x3csource media\x3d"(min-width: 421px)" data-srcset\x3d"' +
            b +
            '"\x3e\n                     \x3cimg class\x3d"lazyload" data-src\x3d"' +
            b +
            '"  alt\x3d"dest Offer Image" \x3e\n                 \x3c/picture\x3e\n                 \x3cdiv class\x3d"img-overlay"\x3e\x3c/div\x3e\n              \x3c/div\x3e\n\n            \x3cdiv class\x3d"over-btn"\x3e\n                \x3cbutton id\x3d"earlyBirdOfferBtn" onclick\x3d"goToAppliedOfferBooking(\'' +
            a.promoCode +
            '\')" class\x3d"btn book-btn pull-right ' +
            a.promoClass +
            '" \n                 data-direction\x3d"bottom" data-controls-modal\x3d"bookingWidget" data-backdrop\x3d"static" data-keyboard\x3d"false"\x3eBook Now\x3c/button\x3e\n            \x3c/div\x3e\n            \x3cdiv class\x3d"over-content"\x3e\n                \x3cdiv class\x3d"pdlr-15"\x3e\n\n                    \x3ch3 class\x3d"large_plus_text"\x3e\n\t\t\t\t\t\t\x3ci\x3e' +
            a.promoName +
            '\x3c/i\x3e\x3cbr\x3e \x3cspan\n\t\t\t\t\t\t\tclass\x3d"small_text"\x3e' +
            a.promoMsg +
            "\x3c/span\x3e\n\t\t\t\t\t\x3c/h3\x3e\n\n                \x3c/div\x3e\n            \x3c/div\x3e\n        \x3c/div\x3e\n    \x3c/div\x3e"
        );
    };
    if (a)
        if (((offerData = []), 0 < a.length)) {
            for (var c = 0; c < a.length; c++) {
                var d = filterDestOfferByMappedResort(a[c]);
                d &&
                    0 < d.length &&
                    ((a[c].promoClass = "secondary-link"),
                    (a[c].desResortArr = d),
                    a[c].promoForLoggedin && "true" == a[c].promoForLoggedin
                        ? (d = session_get()) &&
                          d.isLoggedIn &&
                          (offerData.push({ imageThumbnail: a[c].body.imageThumbnail, promoClass: a[c].promoClass, promoName: a[c].promoName, promoMsg: a[c].body.promoMsg, promoCode: a[c].promoCode }), offerAtTheDestArr.push(a[c]))
                        : (offerData.push({ url: a[c].url, imageThumbnail: a[c].body.imageThumbnail, promoClass: a[c].promoClass, promoName: a[c].promoName, promoMsg: a[c].body.promoMsg, promoCode: a[c].promoCode }),
                          offerAtTheDestArr.push(a[c])));
            }
            a = offerData.map(b).join("");
            $("#promoDest-carousel").html(a);
            $("#promo-carousel").owlCarousel({ navigation: !0, items: 3, itemsDesktop: [1199, 3], itemsDesktopSmall: [979, 3] });
        } else $("#hsd-dest-offer").hide();
    else $("#hsd-dest-offer").hide();
}
function filterDestOfferByMappedResort(a) {
    var b = [];
    a &&
        a.body &&
        a.body.mappedResortsArray &&
        $.each(a.body.mappedResortsArray, function (a, d) {
            $.each(destOfferResortArr, function (a, c) {
                c && d && d.masterName && c == d.masterName && ((a = {}), (a.value = c), b.push(a));
            });
        });
    return b;
}
