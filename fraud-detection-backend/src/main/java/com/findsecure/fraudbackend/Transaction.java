package com.findsecure.fraudbackend;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long internalId;

    @Column(name = "txn_id", unique = true)
    private String id;
    
    private String time;
    private String date;
    private String loc;
    private Double amt;
    private Integer score;
    private String status;

    public Transaction() {}

    public Long getInternalId() { return internalId; }
    public void setInternalId(Long internalId) { this.internalId = internalId; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getLoc() { return loc; }
    public void setLoc(String loc) { this.loc = loc; }

    public Double getAmt() { return amt; }
    public void setAmt(Double amt) { this.amt = amt; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
