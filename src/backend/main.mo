import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Order "mo:core/Order";

actor {
  type Segment = {
    id : Nat;
    name : Text;
    description : Text;
    ageMin : Nat;
    ageMax : Nat;
    incomeMin : Nat;
    incomeMax : Nat;
    accountTypes : [Text];
    riskProfile : Text;
    customerCount : Nat;
    revenueContribution : Float;
    createdAt : Int;
  };

  module Segment {
    public func compare(s1 : Segment, s2 : Segment) : Order.Order {
      Nat.compare(s1.id, s2.id);
    };
  };

  type DashboardStats = {
    totalCustomers : Nat;
    totalSegments : Nat;
    topRevenueSegment : Text;
    averageCustomerValue : Float;
  };

  type DatasetMetadata = {
    id : Nat;
    filename : Text;
    uploadedAt : Int;
    rowCount : Nat;
    columns : [Text];
    blobId : Text;
    status : Text;
  };

  module DatasetMetadata {
    public func compare(d1 : DatasetMetadata, d2 : DatasetMetadata) : Order.Order {
      Nat.compare(d2.id, d1.id);
    };
  };

  let segments = Map.empty<Nat, Segment>();
  var nextId = 1;
  var seeded = false;

  let datasets = Map.empty<Nat, DatasetMetadata>();
  var nextDatasetId = 1;

  func ensureSegmentExists(id : Nat) : () {
    if (not segments.containsKey(id)) {
      Runtime.trap("Segment does not exist. ");
    };
  };

  public shared ({ caller }) func seedSegments() : async () {
    if (seeded) {
      return;
    };

    for (segment in getSampleSegments().values()) {
      segments.add(segment.id, segment);
      nextId += 1;
    };

    seeded := true;
  };

  func getSampleSegments() : [Segment] {
    let now = Time.now();

    [
      {
        id = 1;
        name = "Premium";
        description = "High net-worth individuals";
        ageMin = 30;
        ageMax = 65;
        incomeMin = 100000;
        incomeMax = 1000000;
        accountTypes = ["Savings", "Investment"];
        riskProfile = "Low";
        customerCount = 5000;
        revenueContribution = 5_000_000.0;
        createdAt = now;
      },
      {
        id = 2;
        name = "Mass Market";
        description = "Average income customers";
        ageMin = 25;
        ageMax = 55;
        incomeMin = 20000;
        incomeMax = 100000;
        accountTypes = ["Savings", "Checking"];
        riskProfile = "Medium";
        customerCount = 30000;
        revenueContribution = 15_000_000.0;
        createdAt = now;
      },
      {
        id = 3;
        name = "Youth";
        description = "Young adults";
        ageMin = 18;
        ageMax = 24;
        incomeMin = 0;
        incomeMax = 20000;
        accountTypes = ["Savings"];
        riskProfile = "High";
        customerCount = 10000;
        revenueContribution = 2_000_000.0;
        createdAt = now;
      },
      {
        id = 4;
        name = "Retirees";
        description = "Older customers";
        ageMin = 65;
        ageMax = 99;
        incomeMin = 15000;
        incomeMax = 50000;
        accountTypes = ["Savings", "Fixed Deposit"];
        riskProfile = "Low";
        customerCount = 8000;
        revenueContribution = 3_000_000.0;
        createdAt = now;
      },
      {
        id = 5;
        name = "SME Business";
        description = "Small and medium enterprises";
        ageMin = 25;
        ageMax = 65;
        incomeMin = 50000;
        incomeMax = 1000000;
        accountTypes = ["Business Account"];
        riskProfile = "Medium";
        customerCount = 2000;
        revenueContribution = 10_000_000.0;
        createdAt = now;
      },
    ];
  };

  public shared ({ caller }) func createSegment(segment : Segment) : async Nat {
    let newSegment : Segment = {
      segment with
      id = nextId;
      createdAt = Time.now();
    };
    segments.add(nextId, newSegment);
    let createdId = nextId;
    nextId += 1;
    createdId;
  };

  public query ({ caller }) func getAllSegments() : async [Segment] {
    segments.values().toArray().sort();
  };

  public query ({ caller }) func getSegmentById(id : Nat) : async Segment {
    switch (segments.get(id)) {
      case (null) { Runtime.trap("Segment does not exist. ") };
      case (?segment) { segment };
    };
  };

  public shared ({ caller }) func updateSegment(id : Nat, segment : Segment) : async () {
    ensureSegmentExists(id);
    let updatedSegment : Segment = {
      segment with
      id;
      createdAt = Time.now();
    };
    segments.add(id, updatedSegment);
  };

  public shared ({ caller }) func deleteSegment(id : Nat) : async () {
    ensureSegmentExists(id);
    segments.remove(id);
  };

  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    var totalCustomers = 0;
    var totalRevenue = 0.0;
    var totalRevenueSegments = 0.0;
    var topRevenue = 0.0;
    var topRevenueSegment = "";
    var totalCustomerCount = 0;

    for (segment in segments.values()) {
      totalCustomers += segment.customerCount;
      totalRevenueSegments += segment.revenueContribution;
      totalCustomerCount += 1;

      if (segment.revenueContribution > topRevenue) {
        topRevenue := segment.revenueContribution;
        topRevenueSegment := segment.name;
      };
    };

    let averageCustomerValue = if (totalCustomerCount > 0) {
      totalRevenueSegments / totalCustomerCount.toFloat();
    } else {
      0.0;
    };

    {
      totalCustomers;
      totalSegments = segments.size();
      topRevenueSegment;
      averageCustomerValue;
    };
  };

  public shared ({ caller }) func saveDatasetMetadata(filename : Text, rowCount : Nat, columns : [Text], blobId : Text) : async Nat {
    let meta : DatasetMetadata = {
      id = nextDatasetId;
      filename;
      uploadedAt = Time.now();
      rowCount;
      columns;
      blobId;
      status = "Ready";
    };
    datasets.add(nextDatasetId, meta);
    let savedId = nextDatasetId;
    nextDatasetId += 1;
    savedId;
  };

  public query ({ caller }) func getDatasetHistory() : async [DatasetMetadata] {
    datasets.values().toArray().sort();
  };

  public shared ({ caller }) func deleteDataset(id : Nat) : async () {
    datasets.remove(id);
  };
};
