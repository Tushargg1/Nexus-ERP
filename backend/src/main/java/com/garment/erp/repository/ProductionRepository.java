package com.garment.erp.repository;

import com.garment.erp.entity.Production;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductionRepository extends JpaRepository<Production, Long> {

    List<Production> findByStageNot(Production.ProductionStage stage);

    List<Production> findByStage(Production.ProductionStage stage);

    List<Production> findByProductId(Long productId);
}
