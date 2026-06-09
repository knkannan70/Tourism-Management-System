package com.tourism.repository;

import com.tourism.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUserId(Long userId);
    Optional<Wishlist> findByUserIdAndTourPackageId(Long userId, Long packageId);
    boolean existsByUserIdAndTourPackageId(Long userId, Long packageId);
    void deleteByUserId(Long userId);
    void deleteByTourPackageId(Long packageId);
}
