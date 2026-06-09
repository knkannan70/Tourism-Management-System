package com.tourism.service;

import com.tourism.dto.request.CategoryRequest;
import com.tourism.dto.response.CategoryResponse;
import com.tourism.entity.Category;
import com.tourism.exception.BadRequestException;
import com.tourism.exception.ResourceNotFoundException;
import com.tourism.repository.CategoryRepository;
import com.tourism.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final PlaceRepository placeRepository;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Long id) {
        return toResponse(findCategory(id));
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByCategoryName(request.getCategoryName())) {
            throw new BadRequestException("Category already exists");
        }
        Category category = Category.builder()
                .categoryName(request.getCategoryName())
                .build();
        return toResponse(categoryRepository.save(category));
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findCategory(id);
        if (categoryRepository.existsByCategoryName(request.getCategoryName()) && 
            !category.getCategoryName().equalsIgnoreCase(request.getCategoryName())) {
            throw new BadRequestException("Category name already exists");
        }
        category.setCategoryName(request.getCategoryName());
        return toResponse(categoryRepository.save(category));
    }

    public void deleteCategory(Long id) {
        Category category = findCategory(id);
        long count = placeRepository.countByCategoryId(id);
        if (count > 0) {
            throw new BadRequestException("Cannot delete category as it is linked to " + count + " places");
        }
        categoryRepository.delete(category);
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    public CategoryResponse toResponse(Category c) {
        if (c == null) return null;
        long count = placeRepository.countByCategoryId(c.getId());
        return CategoryResponse.builder()
                .id(c.getId())
                .categoryName(c.getCategoryName())
                .placeCount(count)
                .build();
    }
}
