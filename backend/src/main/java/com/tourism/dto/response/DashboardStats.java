package com.tourism.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStats {
    private long totalUsers;
    private long totalPackages;
    private long totalBookings;
    private long pendingBookings;
    private long confirmedBookings;
    private long cancelledBookings;
    private BigDecimal totalRevenue;
    private long totalPlaces;
    private long totalHotels;
    private long totalFeedbacks;
    private long totalReviews;
    private Double averageRating;
    private long completedBookings;
    private long totalCategories;
    
    private List<MonthlyBooking> monthlyBookings;
    private List<RecentBooking> recentBookings;
    
    private List<StateAnalytic> stateAnalytics;
    private List<DistrictAnalytic> districtAnalytics;
    private List<CategoryAnalytic> categoryAnalytics;
    private List<PlaceAnalytic> placeAnalytics;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyBooking {
        private String month;
        private long bookings;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentBooking {
        private Long id;
        private String userName;
        private String packageName;
        private java.time.LocalDate bookingDate;
        private BigDecimal totalAmount;
        private String status;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StateAnalytic {
        private Long id;
        private String stateName;
        private long placesCount;
        private long bookingsCount;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DistrictAnalytic {
        private Long id;
        private String districtName;
        private String stateName;
        private long placesCount;
        private long bookingsCount;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategoryAnalytic {
        private Long id;
        private String categoryName;
        private long placesCount;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PlaceAnalytic {
        private Long id;
        private String placeName;
        private String districtName;
        private String stateName;
        private long hotelCount;
        private long packageCount;
    }
}
