/*
ALL OF THE TELEMETRY QUERY OPERATIONS WILL GO HERE:

1. CREATE AN INDEX ON "id" AND "device.timestamp"
2. CREATE UTILIZATION CALCULATION FUNCTION BASED ON: https://en.wikipedia.org/wiki/Utilization_facto
   THIS WOULD ALLOW FOR SUMMARY CALCULATIONS SUCH AS:
        a. Most utilized equipment
        b. Least utilized equipment
        c. Additionally display utilization of all devices


3. CREATE QUERY TO FIND THE DEVICE(S) WITH MOST TOTAL POWER CONSUMPTION FOR A TIME PERIOD
4. CREATE QUERY TO FIND THE TOTAL POWER CONSUMPTION FOR A TIME RANGE
5. QUERIES SHOULD HAVE A FEW FILTERS LIKE "TODAY", "LAST WEEK", "LAST MONTH"

6. FUTURE: BASED ON THE RESEARCH, FIND SUITABLE LINE CHART GRAPH TO REPRESENT CURRENT USAGE FOR
   A CERTAIN DEVICE FOR ONE USAGE.


*/