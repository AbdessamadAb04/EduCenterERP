package com.educentererp.module.classe;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClasseRepository extends JpaRepository<Classe, Long> {

    List<Classe> findByArchived(boolean archived);

}
