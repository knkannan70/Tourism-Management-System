package com.tourism.service;

import com.tourism.dto.response.DashboardStats;
import com.tourism.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Map;
import java.time.format.TextStyle;
import java.util.Locale;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final BookingRepository bookingRepository;
    private final PlaceRepository placeRepository;
    private final HotelRepository hotelRepository;
    private final FeedbackRepository feedbackRepository;
    private final CategoryRepository categoryRepository;
    private final StateRepository stateRepository;
    private final DistrictRepository districtRepository;
    private final PlaceReviewRepository placeReviewRepository;
    private final HotelReviewRepository hotelReviewRepository;

    public DashboardStats getStats() {
        BigDecimal revenue = bookingRepository.sumRevenue();

        // Group bookings chronologically by Month
        Map<java.time.Month, Long> monthlyCounts = bookingRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        b -> b.getBookingDate().getMonth(),
                        Collectors.counting()
                ));

        List<DashboardStats.MonthlyBooking> monthlyBookings = monthlyCounts.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> DashboardStats.MonthlyBooking.builder()
                        .month(entry.getKey().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                        .bookings(entry.getValue())
                        .build())
                .collect(Collectors.toList());

        // Get 5 most recent bookings
        List<com.tourism.entity.Booking> allBookings = bookingRepository.findAll();
        List<DashboardStats.RecentBooking> recentBookings = allBookings.stream()
                .sorted((b1, b2) -> b2.getBookingDate().compareTo(b1.getBookingDate()))
                .limit(5)
                .map(b -> DashboardStats.RecentBooking.builder()
                        .id(b.getId())
                        .userName(b.getUser().getFullName())
                        .packageName(b.getTourPackage().getPackageName())
                        .bookingDate(b.getBookingDate())
                        .totalAmount(b.getTotalAmount())
                        .status(b.getBookingStatus())
                        .build())
                .collect(Collectors.toList());

        // State-wise & District-wise booking mapping
        Map<Long, Long> bookingsByState = allBookings.stream()
                .filter(b -> b.getTourPackage() != null && b.getTourPackage().getPlace() != null && b.getTourPackage().getPlace().getState() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getTourPackage().getPlace().getState().getId(),
                        Collectors.counting()
                ));

        Map<Long, Long> bookingsByDistrict = allBookings.stream()
                .filter(b -> b.getTourPackage() != null && b.getTourPackage().getPlace() != null && b.getTourPackage().getPlace().getDistrict() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getTourPackage().getPlace().getDistrict().getId(),
                        Collectors.counting()
                ));

        // State Analytics
        List<DashboardStats.StateAnalytic> stateAnalytics = stateRepository.findAll().stream()
                .map(state -> DashboardStats.StateAnalytic.builder()
                        .id(state.getId())
                        .stateName(state.getStateName())
                        .placesCount(placeRepository.countByStateId(state.getId()))
                        .bookingsCount(bookingsByState.getOrDefault(state.getId(), 0L))
                        .build())
                .collect(Collectors.toList());

        // District Analytics
        List<DashboardStats.DistrictAnalytic> districtAnalytics = districtRepository.findAll().stream()
                .map(district -> DashboardStats.DistrictAnalytic.builder()
                        .id(district.getId())
                        .districtName(district.getDistrictName())
                        .stateName(district.getState() != null ? district.getState().getStateName() : "Unknown")
                        .placesCount(placeRepository.countByDistrictId(district.getId()))
                        .bookingsCount(bookingsByDistrict.getOrDefault(district.getId(), 0L))
                        .build())
                .collect(Collectors.toList());

        // Category Analytics
        List<DashboardStats.CategoryAnalytic> categoryAnalytics = categoryRepository.findAll().stream()
                .map(cat -> DashboardStats.CategoryAnalytic.builder()
                        .id(cat.getId())
                        .categoryName(cat.getCategoryName())
                        .placesCount(placeRepository.countByCategoryId(cat.getId()))
                        .build())
                .collect(Collectors.toList());

        // Place Analytics — place-wise hotel count and package count
        List<DashboardStats.PlaceAnalytic> placeAnalytics = placeRepository.findAll().stream()
                .map(place -> DashboardStats.PlaceAnalytic.builder()
                        .id(place.getId())
                        .placeName(place.getPlaceName())
                        .districtName(place.getDistrict() != null ? place.getDistrict().getDistrictName() : "—")
                        .stateName(place.getState() != null ? place.getState().getStateName() : "—")
                        .hotelCount(hotelRepository.countByPlaceId(place.getId())
                                + hotelRepository.countByDistrictId(place.getDistrict() != null ? place.getDistrict().getId() : -1L))
                        .packageCount(packageRepository.countByPlaceId(place.getId()))
                        .build())
                .collect(Collectors.toList());

        return DashboardStats.builder()
                .totalUsers(userRepository.count())
                .totalPackages(packageRepository.count())
                .totalBookings(bookingRepository.count())
                .pendingBookings(bookingRepository.countByBookingStatus("PENDING"))
                .confirmedBookings(bookingRepository.countByBookingStatus("CONFIRMED"))
                .cancelledBookings(bookingRepository.countByBookingStatus("CANCELLED"))
                .completedBookings(bookingRepository.countByBookingStatus("COMPLETED"))
                .totalRevenue(revenue != null ? revenue : BigDecimal.ZERO)
                .totalPlaces(placeRepository.count())
                .totalHotels(hotelRepository.count())
                .totalFeedbacks(feedbackRepository.count())
                .totalReviews(placeReviewRepository.count() + hotelReviewRepository.count())
                .averageRating(feedbackRepository.averageRating() != null ? feedbackRepository.averageRating() : 0.0)
                .totalCategories(categoryRepository.count())
                .monthlyBookings(monthlyBookings)
                .recentBookings(recentBookings)
                .stateAnalytics(stateAnalytics)
                .districtAnalytics(districtAnalytics)
                .categoryAnalytics(categoryAnalytics)
                .placeAnalytics(placeAnalytics)
                .build();
    }

    public List<Map<String, Object>> getRevenueReport() {
        Map<java.time.Month, BigDecimal> monthlyRevenue = bookingRepository.findAll().stream()
                .filter(b -> "CONFIRMED".equals(b.getBookingStatus()))
                .collect(Collectors.groupingBy(
                        b -> b.getBookingDate().getMonth(),
                        Collectors.reducing(BigDecimal.ZERO, com.tourism.entity.Booking::getTotalAmount, BigDecimal::add)
                ));

        return monthlyRevenue.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("month", entry.getKey().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
                    map.put("revenue", entry.getValue());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getBookingReport() {
        Map<String, List<com.tourism.entity.Booking>> bookingsByPackage = bookingRepository.findAll().stream()
                .collect(Collectors.groupingBy(b -> b.getTourPackage().getPackageName()));

        return bookingsByPackage.entrySet().stream()
                .map(entry -> {
                    long count = entry.getValue().size();
                    BigDecimal revenueVal = entry.getValue().stream()
                            .filter(b -> "CONFIRMED".equals(b.getBookingStatus()))
                            .map(com.tourism.entity.Booking::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    Map<String, Object> map = new HashMap<>();
                    map.put("packageName", entry.getKey());
                    map.put("bookingsCount", count);
                    map.put("revenue", revenueVal);
                    return map;
                })
                .collect(Collectors.toList());
    }
}
